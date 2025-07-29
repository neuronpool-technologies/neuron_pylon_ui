import {
  Shared,
  NodeShared,
  PylonMetaResp,
  Activity,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { match, P } from "ts-pattern";
import { e8sToIcp } from "./TokenTools";
import {
  calculateDaysAndHoursUntilTimestamp,
  calculateTimeUntilTimestamp,
  convertDaysToMonthsAndYears,
  convertNanosecondsToElapsedTime,
  convertSecondsToDays,
  formatNanosecondsToDateString,
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
    .with(
      { devefi_jes1_ntc_mint: P.not(P.nullish) },
      ({ devefi_jes1_ntc_mint }) =>
        // Since NtcMintActivity has the same structure as Activity, we can cast the type
        (devefi_jes1_ntc_mint?.log || []) as unknown as Activity[]
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
  refreshing?: boolean;
  minimum?: string;
  splits?: Array<bigint>;
  billing: {
    transaction_percentage_fee_e8s: bigint;
    current_balance: bigint;
    account: string;
    cost_per_day: bigint;
    ledger: string;
    flat_fee_multiplier: bigint;
  };
  activity?: Array<Activity>;
  destinations: Array<[string, string]>;
  neuronId?: string;
  neuronFollowee?: string;
  dissolveDelay?: string;
  neuronStatus?: string;
  undisbursedMaturity?: string;
  lastUpdated?: string;
  mintStatus?: string;
  disbursingMaturity?: Array<{
    amount_e8s: number;
    timeleft: string;
  }>;
  varFollowee?: string;
  varDissolve?: string;
  varDelay?: string;
};

export const extractNodeType = (
  vector: NodeShared,
  meta: PylonMetaResp
): NodeTypeResult => {
  // Common properties
  const created = formatNanosecondsToDateString(Number(vector.created));
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
  const transactionFeePercentageE8s: bigint = match(
    vector.billing.transaction_fee
  )
    .with(
      { transaction_percentage_fee_e8s: P.not(P.nullish) },
      ({ transaction_percentage_fee_e8s }) => transaction_percentage_fee_e8s
    )
    .otherwise(() => BigInt(0));

  const flatTransactionFee: bigint = match(vector.billing.transaction_fee)
    .with(
      { flat_fee_multiplier: P.not(P.nullish) },
      ({ flat_fee_multiplier }) => flat_fee_multiplier
    )
    .otherwise(() => BigInt(0));

  const billingInfo = {
    transaction_percentage_fee_e8s: transactionFeePercentageE8s,
    current_balance: vector.billing.current_balance,
    account: accountToString(vector.billing.account),
    cost_per_day: vector.billing.cost_per_day,
    ledger: meta.billing.ledger.toString(),
    flat_fee_multiplier: flatTransactionFee,
  };

  // Helper function to get token info
  const getTokenInfo = () => {
    const sourceToUse = vector.sources[1] || vector.sources[0];

    const ledgerUsed =
      "ic" in sourceToUse?.endpoint
        ? sourceToUse?.endpoint.ic.ledger.toString()
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
          ).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} ICP`,
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
          refreshing: devefi_jes1_icpneuron.internals.refresh_idx.length > 0,
          minimum: "Minimum >20 ICP",
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
          undisbursedMaturity: e8sToIcp(
            Number(devefi_jes1_icpneuron.cache.maturity_e8s_equivalent?.[0])
          ).toFixed(4),
          lastUpdated: updatingStatus,
          disbursingMaturity:
            devefi_jes1_icpneuron.cache.maturity_disbursements_in_progress?.[0]?.map(
              (item) => ({
                amount_e8s: Number(item.amount_e8s),
                timeleft: calculateDaysAndHoursUntilTimestamp(
                  Number(item.finalize_disbursement_timestamp_seconds[0])
                ),
              })
            ) || [],
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
          ).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} ${symbol}`,
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
          refreshing: devefi_jes1_snsneuron.internals.refresh_idx.length > 0,
          minimum: `Minimum ${e8sToIcp(
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
          neuronFollowee: devefi_jes1_snsneuron.neuron_cache[0]
            ?.topic_followees?.[0]?.topic_id_to_followees?.[1]?.[1]
            ?.followees?.[0]?.neuron_id?.[0]?.id
            ? uint8ArrayToHexString(
                devefi_jes1_snsneuron.neuron_cache[0]?.topic_followees?.[0]
                  ?.topic_id_to_followees?.[1]?.[1]?.followees?.[0]
                  ?.neuron_id?.[0]?.id
              )
            : "None",
          dissolveDelay: devefi_jes1_snsneuron.neuron_cache[0]
            ?.dissolve_state?.[0]
            ? match(devefi_jes1_snsneuron.neuron_cache[0].dissolve_state[0])
                .with({ DissolveDelaySeconds: P.select() }, (seconds) =>
                  Number(seconds) > 0n
                    ? convertDaysToMonthsAndYears(
                        convertSecondsToDays(Number(seconds))
                      )
                    : "None"
                )
                .with(
                  { WhenDissolvedTimestampSeconds: P.select() },
                  (seconds) => calculateTimeUntilTimestamp(Number(seconds))
                )
                .otherwise(() => "None")
            : "None",
          neuronStatus: devefi_jes1_snsneuron.neuron_cache[0]
            ?.dissolve_state?.[0]
            ? match(devefi_jes1_snsneuron.neuron_cache[0].dissolve_state[0])
                .with({ DissolveDelaySeconds: P._ }, () => "Locked")
                .with(
                  { WhenDissolvedTimestampSeconds: P._ },
                  () => "Dissolving"
                )
                .otherwise(() => "None")
            : "None",
          undisbursedMaturity: e8sToIcp(
            Number(
              devefi_jes1_snsneuron.neuron_cache[0]?.maturity_e8s_equivalent
            )
          ).toFixed(4),
          lastUpdated: updatingStatus,
          disbursingMaturity:
            devefi_jes1_snsneuron.neuron_cache[0]?.disburse_maturity_in_progress?.map(
              (item) => ({
                amount_e8s: Number(item.amount_e8s),
                timeleft: calculateDaysAndHoursUntilTimestamp(
                  Number(item.finalize_disbursement_timestamp_seconds[0])
                ),
              })
            ) || [],
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
    .with(
      { devefi_jes1_ntc_mint: P.not(P.nullish) },
      ({ devefi_jes1_ntc_mint }) => {
        const { symbol, name, fee } = getTokenInfo();
        const updatingStatus = match(devefi_jes1_ntc_mint.internals.updating)
          .with({ Init: P._ }, () => "Ready")
          .with({ Calling: P._ }, () => "Updating")
          .with({ Done: P.select() }, (timestamp) =>
            convertNanosecondsToElapsedTime(Number(timestamp))
          )
          .exhaustive();

        const MintStatus =
          devefi_jes1_ntc_mint.internals.tx_idx.length > 0
            ? "Minting"
            : "Ready";

        return {
          type: "Mint",
          label: "Mint",
          symbol,
          name,
          value: symbol,
          created,
          controller,
          active: isActive,
          fee: Number(fee),
          billing: billingInfo,
          destinations: destinations,
          refreshing: devefi_jes1_ntc_mint.internals.tx_idx.length > 0,
          minimum: "> 1 ICP",
          lastUpdated: updatingStatus,
          mintStatus: MintStatus,
          activity: extractAllLogs(vector),
        };
      }
    )
    .with(
      { devefi_jes1_ntc_redeem: P.not(P.nullish) },
      ({ devefi_jes1_ntc_redeem }) => {
        const { symbol, name, fee } = getTokenInfo();
        return {
          type: "Redeem",
          label: "Redeem",
          symbol,
          name,
          value: symbol,
          created,
          controller,
          active: isActive,
          fee: Number(fee),
          billing: billingInfo,
          destinations: destinations,
          splits: devefi_jes1_ntc_redeem.variables.split,
        };
      }
    )
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

export const computeUsdValueOfNodes = ({
  nodes,
  prices,
  meta,
  decimals = 2,
}: {
  nodes: NodeShared[];
  prices: Array<Record<string, any>> | null;
  meta: PylonMetaResp | null;
  decimals?: number;
}) => {
  if (!meta || !prices || !nodes.length) return;

  let totalValue = 0;

  for (const node of nodes) {
    const { symbol, amount } = extractNodeType(node, meta);

    const tokenRate = prices?.find((price) => price.symbol === symbol);
    if (!tokenRate || !amount) continue;

    totalValue += Number(amount) * tokenRate.last_price;
  }

  return `$${totalValue.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};
