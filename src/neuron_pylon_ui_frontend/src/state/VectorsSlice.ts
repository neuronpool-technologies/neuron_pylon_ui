import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ActorSubclass } from "@dfinity/agent";
import {
  _SERVICE as NeuronPylon,
  NodeShared,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { _SERVICE as Router } from "@/chrono/declarations/chrono_router/chrono_router.did.js";
import { fetchVectors } from "@/client/fetchVectors";
import { SearchResp } from "@/chrono/declarations/chrono_slice/chrono_slice.did";

type VectorsState = {
  vectors: NodeShared[];
  chrono_log: SearchResp;
  status: string;
  error: string | null;
};

const initialState: VectorsState = {
  vectors: [],
  chrono_log: [],
  status: "idle",
  error: null,
};

const VectorsSlice = createSlice({
  name: "vectors",
  initialState,
  reducers: {
    setCleanup: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshVectors.pending, (state) => {
        state.status = "loading";
      })
      .addCase(refreshVectors.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.vectors = action.payload?.vectors ?? [];
        state.chrono_log = action.payload?.chrono_log ?? [];
      })
      .addCase(refreshVectors.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      });
  },
});

export const { setCleanup } = VectorsSlice.actions;

export const refreshVectors = createAsyncThunk(
  "vectors/refreshVectors",
  async ({ pylon, router }: { pylon: ActorSubclass; router: ActorSubclass }) =>
    await fetchVectors({
      pylon: pylon as unknown as ActorSubclass<NeuronPylon>,
      router: router as unknown as ActorSubclass<Router>,
    })
);

export default VectorsSlice.reducer;
