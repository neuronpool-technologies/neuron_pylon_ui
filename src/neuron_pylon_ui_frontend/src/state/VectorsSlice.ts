import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ActorSubclass } from "@dfinity/agent";
import {
  _SERVICE as NeuronPylon,
  NodeShared,
  Activity,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { fetchVectors } from "@/client/fetchVectors";

type PylonVectorsResp = {
  total_icp_staked: number;
  total_vectors: string;
  total_controllers: string;
};

type VectorsState = {
  stats: PylonVectorsResp | null;
  vectors: NodeShared[];
  latest_log: Array<{ log: Activity; node: NodeShared }>;
  status: string;
  error: string | null;
};

const initialState: VectorsState = {
  stats: null,
  vectors: [],
  latest_log: [],
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
        state.stats = action.payload?.stats ?? null;
        state.vectors = action.payload?.vectors ?? [];
        state.latest_log = action.payload?.latest_log ?? [];
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
  async ({ pylon }: { pylon: ActorSubclass }) =>
    await fetchVectors({
      pylon: pylon as unknown as ActorSubclass<NeuronPylon>,
    })
);

export default VectorsSlice.reducer;
