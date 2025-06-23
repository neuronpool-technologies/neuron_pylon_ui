import { ActorSubclass, Actor, HttpAgent } from "@dfinity/agent";
import { NodeShared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { _SERVICE as Router } from "@/chrono/declarations/chrono_router/chrono_router.did.js";
import {
  ChannelSearchReq,
  SearchResp,
  _SERVICE as RouterSlice,
} from "@/chrono/declarations/chrono_slice/chrono_slice.did.js";
import { idlFactory as RouterSliceIDL } from "@/chrono/declarations/chrono_slice/index";
import { toaster } from "@/components/ui/toaster";
import moment from "moment";
import { tsid2tid } from "@/utils/ChronoTools";
import { endpointToBalanceAndAccount } from "@/utils/AccountTools";

export const fetchChronoTail = async ({
  router,
  vectors,
}: {
  router: ActorSubclass<Router>;
  vectors: NodeShared[];
}): Promise<SearchResp> => {
  try {
    const slices = await router.get_slices();
    const chronoLaunchTime = Number(process.env.REACT_APP_CHRONO_LAUNCH_UNIX)
    const now = moment().unix(); // Gets current time in seconds

    // Finds the index of the slices from when chrono was added.
    let slice_idx_from_launch = slices.findIndex(
      (x) => x[1] <= chronoLaunchTime && x[2] > chronoLaunchTime
    );
    // all slices from chrono launch to now
    const sliceTail = slices.slice(slice_idx_from_launch);

    const agent = await HttpAgent.create({
      identity: undefined, // can be anonymous here to fetch slices
      host: "https://icp-api.io",
    });

    // Create an array of promises for each slice
    const slicePromises = sliceTail.map(async (slice) => {
      let routerSlice = Actor.createActor<RouterSlice>(RouterSliceIDL, {
        agent,
        canisterId: slice[0],
      });

      // using ID 0, possibly need to check other ID's
      const fromTsid = tsid2tid(now, 0);

      const chronoQueryArray: ChannelSearchReq[] = [];
      // Create a mapping to track which vector ID is associated with which path
      const pathToVectorMap = new Map<string, number>();

      for (let vector of vectors) {
        const sourcePath0 = `/a/${
          endpointToBalanceAndAccount(vector.sources[0]).account
        }`;
        chronoQueryArray.push({
          direction: { bwd: null },
          from: fromTsid,
          path: {
            exact: sourcePath0,
          },
          limit: BigInt(Number(process.env.REACT_APP_TRANSACTIONS_TO_FETCH)),
        });
        // Store the association between path and vector ID
        pathToVectorMap.set(sourcePath0, vector.id);

        if (vector.sources.length % 2 === 0) {
          const sourcePath1 = `/a/${
            endpointToBalanceAndAccount(vector.sources[1]).account
          }`;
          chronoQueryArray.push({
            direction: { bwd: null },
            from: fromTsid,
            path: {
              exact: sourcePath1,
            },
            limit: BigInt(Number(process.env.REACT_APP_TRANSACTIONS_TO_FETCH)),
          });
          // Store the association for second source as well
          pathToVectorMap.set(sourcePath1, vector.id);
        }
      }

      // Query and return the results
      const data = await routerSlice.chrono_query([
        { search: chronoQueryArray },
      ]);
      return {
        results: data[0].search,
        pathToVectorMap: pathToVectorMap,
      };
    });

    // Execute all slice queries in parallel
    const sliceResults = await Promise.all(slicePromises);

    // Consolidate all path-to-vector mappings
    const masterPathToVectorMap = new Map<string, number>();
    sliceResults.forEach((result) => {
      for (const [path, vectorId] of result.pathToVectorMap.entries()) {
        masterPathToVectorMap.set(path, vectorId);
      }
    });

    // Flatten the results
    const flattenedResults = sliceResults.flatMap((result) => result.results);

    // Deduplicate accounts by merging their CANDID data
    const accountMap = new Map<string, any>();

    for (const [path, channelData] of flattenedResults) {
      const vectorId = masterPathToVectorMap.get(path);

      if (accountMap.has(path)) {
        // If we already have data for this account, merge the CANDID arrays
        if ("CANDID" in channelData && "CANDID" in accountMap.get(path)) {
          const existingData = accountMap.get(path);
          const existingCandidata = existingData.CANDID;
          const newCandidData = channelData.CANDID;

          // Merge the arrays of CANDID data
          accountMap.set(path, {
            CANDID: [...existingCandidata, ...newCandidData],
            vectorId: vectorId, // Include the vector ID
          });
        }
      } else {
        // First occurrence of this account
        if ("CANDID" in channelData) {
          accountMap.set(path, {
            CANDID: channelData.CANDID,
            vectorId: vectorId, // Include the vector ID
          });
        } else {
          accountMap.set(path, {
            ...channelData,
            vectorId: vectorId, // Include the vector ID
          });
        }
      }
    }

    // Convert back to array format expected by the caller
    return Array.from(accountMap.entries());
  } catch (error) {
    console.error(error);

    toaster.create({
      title: "Error fetching chrono logs",
      description: `${String(error).substring(0, 200)}...`,
      type: "warning",
    });

    return [];
  }
};
