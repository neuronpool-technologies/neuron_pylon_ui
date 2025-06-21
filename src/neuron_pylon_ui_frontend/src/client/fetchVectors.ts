import { ActorSubclass, Actor, HttpAgent } from "@dfinity/agent";
import {
  _SERVICE as NeuronPylon,
  NodeShared,
  Activity,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { _SERVICE as Router } from "@/chrono/declarations/chrono_router/chrono_router.did.js";
import {
  ChannelSearchReq,
  SearchResp,
  _SERVICE as RouterSlice,
} from "@/chrono/declarations/chrono_slice/chrono_slice.did.js";
import { idlFactory as RouterSliceIDL } from "@/chrono/declarations/chrono_slice/index";
import { toaster } from "@/components/ui/toaster";
import { extractAllLogs } from "@/utils/Node";
import moment from "moment";
import { tsid2tid } from "@/utils/ChronoTools";
import { endpointToBalanceAndAccount } from "@/utils/AccountTools";

type PylonVectorsResp = {
  vectors: NodeShared[];
  latest_log: Array<{ log: Activity; node: NodeShared }>;
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

    const orderedNodes = nodes
      .flatMap((node) => (node[0] ? [node[0]] : []))
      .reverse();

    const chronoLogs = await fetchChrono({ router, vectors: orderedNodes });

    return {
      vectors: orderedNodes,
      latest_log: latestLogs,
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

const fetchChrono = async ({
  router,
  vectors,
}: {
  router: ActorSubclass<Router>;
  vectors: NodeShared[];
}): Promise<SearchResp | null> => {
  try {
    const slices = await router.get_slices();

    let now = moment().unix(); // Gets current time in seconds

    // Finds the index of the current time slice in the slices array.
    // A slice is considered 'current' if the current timestamp (now) falls within its time range.
    let current_slice_idx = slices.findIndex((x) => x[1] <= now && x[2] > now);

    const agent = await HttpAgent.create({
      identity: undefined, // can be anonymous here to fetch slices
      host: "https://icp-api.io",
    });

    let routerSlice = Actor.createActor<RouterSlice>(RouterSliceIDL, {
      agent,
      canisterId: slices[current_slice_idx][0],
    });

    // using ID 0, possibly need to check other ID's
    const fromTsid = tsid2tid(now, 0);

    // create the query object
    const chronoQueryArray: ChannelSearchReq[] = [];

    for (let vector of vectors) {
      chronoQueryArray.push({
        direction: { bwd: null },
        from: fromTsid,
        path: {
          exact: `/a/${endpointToBalanceAndAccount(vector.sources[0]).account}`,
        },
        limit: BigInt(Number(process.env.REACT_APP_TRANSACTIONS_TO_FETCH)),
      });
      if (vector.sources.length % 2 === 0) {
        chronoQueryArray.push({
          direction: { bwd: null },
          from: fromTsid,
          path: {
            exact: `/a/${
              endpointToBalanceAndAccount(vector.sources[1]).account
            }`,
          },
          limit: BigInt(Number(process.env.REACT_APP_TRANSACTIONS_TO_FETCH)),
        });
      }
    }

    let data = await routerSlice.chrono_query([{ search: chronoQueryArray }]);

    return data[0].search;

    // match(data[0].search[0][1]).with({ CANDID: P.select() }, (CANDID) => {
    //   console.log("CANDID:", CANDID);
    //   console.log(decodeRecord(CANDID[0][1] as Uint8Array));
    // });
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
