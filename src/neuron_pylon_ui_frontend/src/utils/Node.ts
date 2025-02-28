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
  value: string;
  created: string;
  controller: string;
};

export const extractNodeType = (
  vector: NodeShared,
  meta: PylonMetaResp
): NodeTypeResult => {
  // Common properties
  const created = convertNanosecondsToElapsedTime(Number(vector.created));
  const controller = accountToString(vector.controllers[0]);

  // Helper function to get token symbol
  const getTokenSymbol = () => {
    const ledgerUsed =
      "ic" in vector.sources[0]?.endpoint
        ? vector.sources[0].endpoint.ic.ledger.toString()
        : "";

    const token = meta.supported_ledgers.find(
      (ledger) =>
        "ic" in ledger?.ledger && ledger.ledger.ic.toString() === ledgerUsed
    );

    return token?.symbol || "";
  };

  return match(vector.custom?.[0] as Shared)
    .with(
      { devefi_jes1_icpneuron: P.not(P.nullish) },
      ({ devefi_jes1_icpneuron }) => ({
        type: "ICP Neuron",
        label: "Staked",
        value: `${Math.round(
          e8sToIcp(
            Number(devefi_jes1_icpneuron.cache?.cached_neuron_stake_e8s?.[0])
          )
        ).toLocaleString()} ICP`,
        created,
        controller,
      })
    )
    .with(
      { devefi_jes1_snsneuron: P.not(P.nullish) },
      ({ devefi_jes1_snsneuron }) => ({
        type: "SNS Neuron",
        label: "Staked",
        value: `${Math.round(
          e8sToIcp(
            Number(
              devefi_jes1_snsneuron.neuron_cache[0]?.cached_neuron_stake_e8s
            )
          )
        ).toLocaleString()} ${getTokenSymbol()}`,
        created,
        controller,
      })
    )
    .with({ devefi_split: P.not(P.nullish) }, () => ({
      type: "Splitter",
      label: "Split",
      value: getTokenSymbol(),
      created,
      controller,
    }))
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
