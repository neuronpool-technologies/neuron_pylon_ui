import { ActorSubclass } from "@dfinity/agent";
import {
  _SERVICE as NeuronPylon,
  PylonMetaResp,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { toaster } from "@/components/ui/toaster";

export const fetchMeta = async ({
  pylon,
}: {
  pylon: ActorSubclass<NeuronPylon>;
}): Promise<PylonMetaResp | null> => {
  try {
    const meta = await pylon.icrc55_get_pylon_meta();

    return meta;
    
  } catch (error) {
    console.error(error);

    toaster.create({
      title: "Error fetching meta information",
      description: `${String(error).substring(0, 200)}...`,
      type: "warning",
    });

    return null;
  }
};
