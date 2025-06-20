import { ActorSubclass } from "@dfinity/agent";
import {
  _SERVICE as NeuronPylon,
  NodeShared,
  Activity,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { _SERVICE as Router } from "@/chrono/declarations/chrono_router/chrono_router.did.js";
import { toaster } from "@/components/ui/toaster";
import { extractAllLogs } from "@/utils/Node";
import moment from "moment";

type PylonVectorsResp = {
  vectors: NodeShared[];
  latest_log: Array<{ log: Activity; node: NodeShared }>;
  chrono_log: any[]; // TODO: Define a proper type for chrono logs
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

    // Collect all logs from all nodes, sort by timestamp, and take the latest 6
    const latestLogs = nodes
      .flatMap((node) => {
        if (!node[0]) return [];
        // For each log in the node, return an object containing both the log and the node
        return extractAllLogs(node[0]).map((log) => ({
          log,
          node: node[0] as NodeShared,
        }));
      })
      // Sort by timestamp in descending order (most recent first)
      .sort((a, b) => {
        const timestampA =
          "Ok" in a.log
            ? Number(a.log.Ok.timestamp)
            : Number(a.log.Err.timestamp);
        const timestampB =
          "Ok" in b.log
            ? Number(b.log.Ok.timestamp)
            : Number(b.log.Err.timestamp);
        return timestampB - timestampA; // Higher timestamps (more recent) come first
      })
      // Take only the 6 most recent logs
      .slice(0, 6);

    const orderedNodes = nodes.flatMap((node) => (node[0] ? [node[0]] : [])).reverse()

    const chronoLogs = await fetchChrono({ router, vectors: orderedNodes });
    
    return {
      vectors: orderedNodes,
      latest_log: latestLogs,
      chrono_log: [], // Placeholder for chrono logs, to be fetched separately
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

const fetchChrono = async ({
  router,
  vectors,
}: {
  router: ActorSubclass<Router>;
  vectors: NodeShared[];
}): Promise<any> => {
  try {
    const slices = await router.get_slices();

    let now = moment().unix(); // Gets current time in seconds

    // Finds the index of the current time slice in the slices array.
    // A slice is considered 'current' if the current timestamp (now) falls within its time range.
    let current_slice_idx = slices.findIndex((x) => x[1] <= now && x[2] > now);
    console.log(slices[current_slice_idx]);

    // TODO: get all the logs for all the vectors in the neuron pylon, get last X logs for each vector

  } catch (error) {
    console.error(error);

    toaster.create({
      title: "Error fetching chrono logs",
      description: `${String(error).substring(0, 200)}...`,
      type: "warning",
    });

    return null;
  }
};
