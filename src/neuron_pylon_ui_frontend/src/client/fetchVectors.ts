import { ActorSubclass } from "@dfinity/agent";
import {
  _SERVICE as NeuronPylon,
  NodeShared,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { _SERVICE as Router } from "@/chrono/declarations/chrono_router/chrono_router.did.js";
import { SearchResp } from "@/chrono/declarations/chrono_slice/chrono_slice.did.js";
import { toaster } from "@/components/ui/toaster";
import { fetchChronoTail } from "./fetchChronoTail";

type PylonVectorsResp = {
  vectors: NodeShared[];
  chrono_log: SearchResp | null;
};

export const fetchVectors = async ({
  pylon,
  router,
}: {
  pylon: ActorSubclass<NeuronPylon>;
  router: ActorSubclass<Router>;
}): Promise<PylonVectorsResp | null> => {
  try {
    const idObjects = Array.from(
      { length: Number(process.env.REACT_APP_VECTORS_TO_FETCH) },
      (_, i) => ({ id: i })
    );

    const nodes = await pylon.icrc55_get_nodes(idObjects);

    const orderedNodes = nodes
      .flatMap((node) => (node[0] ? [node[0]] : []))
      .reverse();

    const chronoLogs = await fetchChronoTail({ router, vectors: orderedNodes });

    return {
      vectors: orderedNodes,
      chrono_log: chronoLogs,
    };
  } catch (error) {
    console.error(error);

    toaster.create({
      title: "Error fetching vectors",
      description: `${String(error).substring(0, 200)}...`,
      type: "warning",
    });

    return null;
  }
};
