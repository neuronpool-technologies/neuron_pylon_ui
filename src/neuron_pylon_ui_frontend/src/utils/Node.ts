import {
  Shared,
  NodeShared,
  PylonMetaResp,
  Activity,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { match, P } from "ts-pattern";
import { e8sToIcp } from "./TokenTools";
import { convertNanosecondsToElapsedTime } from "./Time";
import { accountToString } from "./AccountTools";

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
};

export const extractNodeType = (
  vector: NodeShared,
  meta: PylonMetaResp
): NodeTypeResult => {
  // Common properties
  const created = convertNanosecondsToElapsedTime(Number(vector.created));
  const controller = accountToString(vector.controllers[0]);

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
      ({ devefi_jes1_icpneuron }) => ({
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
        refreshingStake: devefi_jes1_icpneuron.internals.refresh_idx.length > 0,
        minimumStake: "Minimum 20 ICP",
        billing: billingInfo,
      })
    )
    .with(
      { devefi_jes1_snsneuron: P.not(P.nullish) },
      ({ devefi_jes1_snsneuron }) => {
        const { symbol, name, fee } = getTokenInfo();
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
