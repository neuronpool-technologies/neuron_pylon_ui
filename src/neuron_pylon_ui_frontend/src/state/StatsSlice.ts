import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE as NeuronPylon } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { fetchStats } from "@/client/fetchStats";

type PylonStatsResp = {
  total_icp_staked: string;
  total_icp_maturity: string;
  total_vectors: string;
  total_controllers: string;
};

type StatsState = {
  stats: PylonStatsResp | null;
  status: string;
  error: string | null;
};

const initialState: StatsState = {
  stats: null,
  status: "idle",
  error: null,
};

const StatsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {
    setCleanup: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(refreshStats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = action.payload;
      })
      .addCase(refreshStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      });
  },
});

export const { setCleanup } = StatsSlice.actions;

export const refreshStats = createAsyncThunk(
  "stats/refreshStats",
  async ({ pylon }: { pylon: ActorSubclass }) =>
    await fetchStats({
      pylon: pylon as unknown as ActorSubclass<NeuronPylon>,
    })
);

export default StatsSlice.reducer;
