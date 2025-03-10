import {
  Shared,
  NodeShared,
  PylonMetaResp,
  Activity,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { match, P } from "ts-pattern";
import { e8sToIcp } from "./TokenTools";
import {
  calculateTimeUntilTimestamp,
  convertDaysToMonthsAndYears,
  convertNanosecondsToElapsedTime,
  convertSecondsToDays,
} from "./Time";
import { accountToString } from "./AccountTools";
import { uint8ArrayToHexString } from "@dfinity/utils";

// Extract logs from nodes and combine them into a single array
export const extractAllLogs = (node: NodeShared): Array<Activity> => {
  const { custom } = node;
  if (!custom || !custom[0]) return [];

  return match(custom[0] as Shared)
    .with(
      { devefi_jes1_icpneuron: P.not(P.nullish) },
      ({ devefi_jes1_icpneuron }) => devefi_jes1_icpneuron?.log || []
    )
    .with(
      { devefi_jes1_snsneuron: P.not(P.nullish) },
      ({ devefi_jes1_snsneuron }) =>
        // Since SnsNeuronActivity has the same structure as Activity, we can cast the type
        (devefi_jes1_snsneuron?.log || []) as unknown as Activity[]
    )
    .otherwise(() => []);
};

export type NodeTypeResult = {
  type: string;
  label: string;
  symbol: string;
  name: string;
  amount?: string;
  value: string;
  created: string;
  controller: string;
  active: boolean;
  fee: number;
  refreshingStake?: boolean;
  minimumStake?: string;
  billing: {
    transaction_percentage_fee_e8s: bigint;
    current_balance: bigint;
    account: string;
    cost_per_day: bigint;
    ledger: string;
  };
  activity?: Array<Activity>;
  destinations: Array<[string, string]>;
  neuronId?: string;
  neuronFollowee?: string;
  dissolveDelay?: string;
  neuronStatus?: string;
  unspawnedMaturity?: string;
  lastUpdated?: string;
  spawningMaturity?: string;
  varFollowee?: string;
  varDissolve?: string;
  varDelay?: string;
};

export const extractNodeType = (
  vector: NodeShared,
  meta: PylonMetaResp
): NodeTypeResult => {
  // Common properties
  const created = convertNanosecondsToElapsedTime(Number(vector.created));
  const controller = accountToString(vector.controllers[0]);

  // Map destinations to an array of tuples [name, address]
  const destinations = vector.destinations.reduce<Array<[string, string]>>(
    (acc, dest) => {
      let address = "unknown";
      if (
        "ic" in dest.endpoint &&
        dest.endpoint.ic.account &&
        dest.endpoint.ic.account[0]
      ) {
        address = accountToString(dest.endpoint.ic.account[0]);
      }
      acc.push([dest.name, address]);
      return acc;
    },
    []
  );

  // Calculate active status - true if node is active AND not frozen
  const isActive = vector.active && !vector.billing.frozen;

  // Extract billing information to be included in all return types
  const transactionFee: bigint = match(vector.billing.transaction_fee)
    .with(
      { transaction_percentage_fee_e8s: P.not(P.nullish) },
      ({ transaction_percentage_fee_e8s }) => transaction_percentage_fee_e8s
    )
    .otherwise(() => BigInt(0));

  const billingInfo = {
    transaction_percentage_fee_e8s: transactionFee,
    current_balance: vector.billing.current_balance,
    account: accountToString(vector.billing.account),
    cost_per_day: vector.billing.cost_per_day,
    ledger: meta.billing.ledger.toString(),
  };

  // Helper function to get token info
  const getTokenInfo = () => {
    const ledgerUsed =
      "ic" in vector.sources[0]?.endpoint
        ? vector.sources[0].endpoint.ic.ledger.toString()
        : "";

    const token = meta.supported_ledgers.find(
      (ledger) =>
        "ic" in ledger?.ledger && ledger.ledger.ic.toString() === ledgerUsed
    );

    return {
      symbol: token?.symbol || "",
      name: token?.name || "",
      fee: token?.fee || 0,
    };
  };

  return match(vector.custom?.[0] as Shared)
    .with(
      { devefi_jes1_icpneuron: P.not(P.nullish) },
      ({ devefi_jes1_icpneuron }) => {
        const updatingStatus = match(devefi_jes1_icpneuron.internals.updating)
          .with({ Init: P._ }, () => "Init")
          .with({ Calling: P._ }, () => "Updating")
          .with({ Done: P.select() }, (timestamp) =>
            convertNanosecondsToElapsedTime(Number(timestamp))
          )
          .exhaustive();

        const varFollowee: string = match(
          devefi_jes1_icpneuron.variables.followee
        )
          .with({ Default: P._ }, () => "Default")
          .with({ FolloweeId: P.select() }, (f) => f.toString())
          .exhaustive();

        const varDissolve: string = match(
          devefi_jes1_icpneuron.variables.dissolve_status
        )
          .with({ Locked: P._ }, () => "Locked")
          .with({ Dissolving: P._ }, () => "Dissolving")
          .exhaustive();

        const varDelay: string = match(
          devefi_jes1_icpneuron.variables.dissolve_delay
        )
          .with({ Default: P._ }, () => "Default")
          .with({ DelayDays: P.select() }, (d) => d.toString())
          .exhaustive();

        return {
          type: "Neuron",
          label: "Stake",
          symbol: "ICP",
          name: "Internet Computer",
          value: `${e8sToIcp(
            Number(devefi_jes1_icpneuron.cache?.cached_neuron_stake_e8s?.[0])
          ).toFixed(2)} ICP`,
          amount: e8sToIcp(
            Number(devefi_jes1_icpneuron.cache?.cached_neuron_stake_e8s?.[0])
          )
            .toFixed(4)
            .toString(),
          created,
          controller,
          active: isActive,
          fee: Number(getTokenInfo().fee),
          billingLedger: meta.billing.ledger.toString(),
          refreshingStake:
            devefi_jes1_icpneuron.internals.refresh_idx.length > 0,
          minimumStake: "Minimum 20 ICP",
          billing: billingInfo,
          activity: extractAllLogs(vector),
          destinations: destinations,
          neuronId:
            devefi_jes1_icpneuron.cache?.neuron_id?.[0]?.toString() ?? "None",
          neuronFollowee:
            devefi_jes1_icpneuron.cache.followees?.[0]?.[1]?.followees[0]?.id.toString() ??
            "None",
          dissolveDelay: devefi_jes1_icpneuron.cache.dissolve_delay_seconds?.[0]
            ? convertDaysToMonthsAndYears(
                convertSecondsToDays(
                  Number(
                    devefi_jes1_icpneuron.cache.dissolve_delay_seconds?.[0]
                  )
                )
              )
            : "None",
          neuronStatus: devefi_jes1_icpneuron.cache.state?.[0]
            ? devefi_jes1_icpneuron.cache.state?.[0] === 1
              ? "Locked"
              : "Dissolving"
            : "None",
          unspawnedMaturity: e8sToIcp(
            Number(devefi_jes1_icpneuron.cache.maturity_e8s_equivalent?.[0])
          ).toFixed(4),
          lastUpdated: updatingStatus,
          spawningMaturity:
            devefi_jes1_icpneuron.internals.spawning_neurons.reduce(
              (accumulator, neuron) =>
                accumulator +
                Number(neuron.maturity_e8s_equivalent[0]) +
                Number(neuron.cached_neuron_stake_e8s[0]),
              0
            ),
          varFollowee: varFollowee,
          varDissolve: varDissolve,
          varDelay: varDelay,
        };
      }
    )
    .with(
      { devefi_jes1_snsneuron: P.not(P.nullish) },
      ({ devefi_jes1_snsneuron }) => {
        const { symbol, name, fee } = getTokenInfo();
        const updatingStatus = match(devefi_jes1_snsneuron.internals.updating)
          .with({ Init: P._ }, () => "Init")
          .with({ Calling: P._ }, () => "Updating")
          .with({ Done: P.select() }, (timestamp) =>
            convertNanosecondsToElapsedTime(Number(timestamp))
          )
          .exhaustive();

        const varFollowee: string = match(
          devefi_jes1_snsneuron.variables.followee
        )
          .with({ Unspecified: P._ }, () => "Unspecified")
          .with({ FolloweeId: P.select() }, (f) => uint8ArrayToHexString(f))
          .exhaustive();

        const varDissolve: string = match(
          devefi_jes1_snsneuron.variables.dissolve_status
        )
          .with({ Locked: P._ }, () => "Locked")
          .with({ Dissolving: P._ }, () => "Dissolving")
          .exhaustive();

        const varDelay: string = match(
          devefi_jes1_snsneuron.variables.dissolve_delay
        )
          .with({ Default: P._ }, () => "Default")
          .with({ DelayDays: P.select() }, (d) => d.toString())
          .exhaustive();

        return {
          type: "Neuron",
          label: "Stake",
          symbol,
          name,
          value: `${e8sToIcp(
            Number(
              devefi_jes1_snsneuron.neuron_cache[0]?.cached_neuron_stake_e8s
            )
          ).toFixed(2)} ${symbol}`,
          amount: e8sToIcp(
            Number(
              devefi_jes1_snsneuron.neuron_cache[0]?.cached_neuron_stake_e8s
            )
          )
            .toFixed(4)
            .toString(),
          created,
          controller,
          active: isActive,
          fee: Number(fee),
          refreshingStake:
            devefi_jes1_snsneuron.internals.refresh_idx.length > 0,
          minimumStake: `Minimum ${e8sToIcp(
            Number(
              devefi_jes1_snsneuron.parameters_cache[0]
                ?.neuron_minimum_stake_e8s
            )
          ).toFixed(4)} ${symbol}`,
          billing: billingInfo,
          activity: extractAllLogs(vector),
          destinations: destinations,
          neuronId: devefi_jes1_snsneuron.neuron_cache[0]?.id[0]?.id
            ? uint8ArrayToHexString(
                devefi_jes1_snsneuron.neuron_cache[0]?.id[0]?.id
              )
            : "None",
          neuronFollowee: devefi_jes1_snsneuron.neuron_cache[0]?.followees[1][1]
            .followees[0].id
            ? uint8ArrayToHexString(
                devefi_jes1_snsneuron.neuron_cache[0]?.followees[1][1]
                  .followees[0].id
              )
            : "None",
          dissolveDelay: match(
            devefi_jes1_snsneuron.neuron_cache[0]?.dissolve_state[0]
          )
            .with({ DissolveDelaySeconds: P.select() }, (seconds) =>
              convertDaysToMonthsAndYears(convertSecondsToDays(Number(seconds)))
            )
            .with({ WhenDissolvedTimestampSeconds: P.select() }, (seconds) =>
              calculateTimeUntilTimestamp(Number(seconds))
            )
            .otherwise(() => "None"),
          neuronStatus: match(
            devefi_jes1_snsneuron.neuron_cache[0]?.dissolve_state[0]
          )
            .with({ DissolveDelaySeconds: P._ }, () => "Locked")
            .with({ WhenDissolvedTimestampSeconds: P._ }, () => "Dissolving")
            .otherwise(() => "None"),
          unspawnedMaturity: e8sToIcp(
            Number(
              devefi_jes1_snsneuron.neuron_cache[0]?.maturity_e8s_equivalent
            )
          ).toFixed(4),
          lastUpdated: updatingStatus,
          snsMaturitySpawning:
            devefi_jes1_snsneuron.neuron_cache[0]
              ?.disburse_maturity_in_progress,
          spawningMaturity: devefi_jes1_snsneuron.neuron_cache[0]
            ?.disburse_maturity_in_progress
            ? Number(
                devefi_jes1_snsneuron.neuron_cache[0].disburse_maturity_in_progress.reduce(
                  (total, item) => total + item.amount_e8s,
                  0n
                )
              )
            : 0,
          varFollowee: varFollowee,
          varDissolve: varDissolve,
          varDelay: varDelay,
        };
      }
    )
    .with({ devefi_split: P.not(P.nullish) }, () => {
      const { symbol, name, fee } = getTokenInfo();
      return {
        type: "Splitter",
        label: "Split",
        symbol,
        name,
        value: symbol,
        created,
        controller,
        active: isActive,
        fee: Number(fee),
        billing: billingInfo,
        destinations: destinations,
      };
    })
    .exhaustive();
};

export type ActivityTypeResult = {
  isError: boolean;
  operation: string;
  timestamp: string;
  message?: string; // Optional field that will only exist for errors
};

export const extractActivityType = (activity: Activity): ActivityTypeResult => {
  return match(activity)
    .with({ Ok: P.select() }, (ok) => ({
      isError: false,
      operation: ok.operation,
      timestamp: convertNanosecondsToElapsedTime(Number(ok.timestamp)),
    }))
    .with({ Err: P.select() }, (err) => ({
      isError: true,
      operation: err.operation,
      timestamp: convertNanosecondsToElapsedTime(Number(err.timestamp)),
      message: err.msg,
    }))
    .exhaustive();
};
