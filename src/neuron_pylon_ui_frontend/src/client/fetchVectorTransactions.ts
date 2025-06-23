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

export const fetchVectorTransactions = async ({
  router,
  vector,
  limit = 50,
}: {
  router: ActorSubclass<Router>;
  vector: NodeShared;
  limit?: number;
}): Promise<SearchResp> => {
  try {
    const slices = await router.get_slices();
    const chronoLaunchTime = Number(process.env.REACT_APP_CHRONO_LAUNCH_UNIX);
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

      // Create queries for all vector sources
      const sourcePath0 = `/a/${
        endpointToBalanceAndAccount(vector.sources[0]).account
      }`;
      chronoQueryArray.push({
        direction: { bwd: null },
        from: fromTsid,
        path: {
          exact: sourcePath0,
        },
        limit: BigInt(limit),
      });

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
          limit: BigInt(limit),
        });
      }

      // Query and return the results
      const data = await routerSlice.chrono_query([
        { search: chronoQueryArray },
      ]);
      return data[0].search;
    });

    // Execute all slice queries in parallel
    const sliceResults = await Promise.all(slicePromises);

    // Flatten the results
    const flattenedResults = sliceResults.flatMap((result) => result);

    // Deduplicate accounts by merging their CANDID data
    const accountMap = new Map<string, any>();

    for (const [path, channelData] of flattenedResults) {
      if (accountMap.has(path)) {
        // If we already have data for this account, merge the CANDID arrays
        if ("CANDID" in channelData && "CANDID" in accountMap.get(path)) {
          const existingData = accountMap.get(path);
          const existingCandidata = existingData.CANDID;
          const newCandidData = channelData.CANDID;

          // Merge the arrays of CANDID data
          accountMap.set(path, {
            CANDID: [...existingCandidata, ...newCandidData],
            vectorId: vector.id, // Include the vector ID
          });
        }
      } else {
        // First occurrence of this account
        if ("CANDID" in channelData) {
          accountMap.set(path, {
            CANDID: channelData.CANDID,
            vectorId: vector.id, // Include the vector ID
          });
        } else {
          accountMap.set(path, {
            ...channelData,
            vectorId: vector.id, // Include the vector ID
          });
        }
      }
    }

    // Convert back to array format expected by the caller
    return Array.from(accountMap.entries());
  } catch (error) {
    console.error(error);

    toaster.create({
      title: "Error fetching transactions",
      description: `${String(error).substring(0, 200)}...`,
      type: "warning",
    });

    return [];
  }
};
