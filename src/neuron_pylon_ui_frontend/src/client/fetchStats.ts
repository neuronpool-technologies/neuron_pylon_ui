import { ActorSubclass } from "@dfinity/agent";
import {
  _SERVICE as NeuronPylon,
  Shared,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { toaster } from "@/components/ui/toaster";
import { match, P } from "ts-pattern";
import { e8sToIcp } from "@/utils/TokenTools";

type PylonStatsResp = {
  total_icp_staked: string;
  total_icp_maturity: string;
  total_vectors: string;
  total_controllers: string;
};

export const fetchStats = async ({
  pylon,
}: {
  pylon: ActorSubclass<NeuronPylon>;
}): Promise<PylonStatsResp | null> => {
  try {
    const idObjects = Array.from({ length: 300 }, (_, i) => ({ id: i }));

    const nodes = await pylon.icrc55_get_nodes(idObjects);

    const result = nodes.reduce(
      (acc, node) => {
        // Skip nodes with an empty node[0]
        if (!node[0]) return acc;

        // Extract the controller and convert its owner to a string using toString()
        const controller = node[0].controllers[0];
        const ownerId = controller.owner.toString();
        acc.uniqueOwners.add(ownerId);

        const { custom } = node[0];

        const icpNeuron = match(custom?.[0] as Shared)
          .with(
            { devefi_jes1_icpneuron: P.not(P.nullish) },
            ({ devefi_jes1_icpneuron }) => devefi_jes1_icpneuron
          )
          .otherwise(() => undefined);

        const cache = icpNeuron?.cache;
        const internals = icpNeuron?.internals;

        // Increment totalVectors if node[0] is defined
        const hasVector = 1;

        // Calculate totalStake
        const stake = Number(cache?.cached_neuron_stake_e8s?.[0] || 0);

        // Calculate totalMaturity including any spawning neurons
        const current = Number(cache?.maturity_e8s_equivalent?.[0] || 0);
        const spawning =
          internals?.spawning_neurons?.reduce(
            (spawningAcc, neuron) =>
              spawningAcc +
              Number(neuron.maturity_e8s_equivalent?.[0] || 0) +
              Number(neuron.cached_neuron_stake_e8s?.[0] || 0),
            0
          ) || 0;

        return {
          totalVectors: acc.totalVectors + hasVector,
          totalStake: acc.totalStake + stake,
          totalMaturity: acc.totalMaturity + current + spawning,
          uniqueOwners: acc.uniqueOwners,
        };
      },
      {
        totalVectors: 0,
        totalStake: 0,
        totalMaturity: 0,
        uniqueOwners: new Set<string>(),
      }
    );

    // Extract the computed values and determine the count of unique controllers
    const { totalVectors, totalStake, totalMaturity, uniqueOwners } = result;

    return {
      total_icp_staked: Math.round(
        e8sToIcp(Number(totalStake))
      ).toLocaleString(),
      total_icp_maturity: Math.round(
        e8sToIcp(Number(totalMaturity))
      ).toLocaleString(),
      total_vectors: totalVectors.toLocaleString(),
      total_controllers: uniqueOwners.size.toLocaleString(),
    };
  } catch (error) {
    console.error(error);

    toaster.create({
      title: "Error fetching stats",
      description: `${String(error).substring(0, 200)}...`,
      type: "warning",
    });

    return null;
  }
};
