import { startNeuronPylonClient } from "@/client/Client";
import { showToast } from "@/tools/toast";
import { deepConvertToString } from "@/tools/conversions";
import {
  BillingPylon,
  ModuleMeta,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";

type InitMetaResp = {
  name: string;
  governed_by: string;
  billing: BillingPylon | {};
  modules: ModuleMeta[] | [];
  total_vectors: string;
  total_stake: string;
  total_maturity: string;
};

export const InitMeta = async (): Promise<InitMetaResp> => {
  try {
    const pylon = await startNeuronPylonClient();

    const idObjects = Array.from({ length: 201 }, (_, i) => ({ id: i }));

    // Run both requests in parallel
    const [{ name, governed_by, billing, modules }, nodes] = await Promise.all([
      pylon.icrc55_get_pylon_meta(),
      pylon.icrc55_get_nodes(idObjects),
    ]);

    const { totalVectors, totalStake, totalMaturity } = nodes.reduce(
      (acc, node) => {
        // If node[0] is empty, skip and return the accumulator as-is
        if (!node[0]) return acc;

        const { custom } = node[0];
        const icpNeuron = custom?.[0]?.devefi_jes1_icpneuron;
        const cache = icpNeuron?.cache;
        const internals = icpNeuron?.internals;

        // totalVectors: just check if node[0] is defined
        const hasVector = 1;

        // totalStake
        const stake = Number(cache?.cached_neuron_stake_e8s?.[0] || 0);

        // totalMaturity
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
        };
      },
      {
        totalVectors: 0,
        totalStake: 0,
        totalMaturity: 0,
      }
    );

    return {
      name: name,
      governed_by: governed_by,
      billing: deepConvertToString(billing),
      modules: deepConvertToString(modules),
      total_vectors: totalVectors.toString(),
      total_stake: totalStake.toString(),
      total_maturity: totalMaturity.toString(),
    };
  } catch (error) {
    console.error(error);

    showToast({
      title: "Error fetching meta information",
      description: `${error.toString().substring(0, 200)}...`,
      status: "warning",
    });

    return {
      name: "",
      governed_by: "",
      billing: {},
      modules: [],
      total_vectors: "",
      total_stake: "",
      total_maturity: "",
    };
  }
};
