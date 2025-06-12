import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ActorSubclass } from "@dfinity/agent";
import {
  _SERVICE as NeuronPylon,
  PylonMetaResp,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { fetchMeta } from "@/client/fetchMeta";

type MetaState = {
  meta: PylonMetaResp | null;
  prices: Array<Record<string, any>> | null;
  status: string;
  error: string | null;
};

const initialState: MetaState = {
  meta: null,
  prices: null,
  status: "idle",
  error: null,
};

const MetaSlice = createSlice({
  name: "meta",
  initialState,
  reducers: {
    setCleanup: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshMeta.pending, (state) => {
        state.status = "loading";
      })
      .addCase(refreshMeta.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.meta = action.payload?.meta ?? null;
        state.prices = action.payload?.prices ?? null;
      })
      .addCase(refreshMeta.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      });
  },
});

export const { setCleanup } = MetaSlice.actions;

export const refreshMeta = createAsyncThunk(
  "meta/refreshMeta",
  async ({ pylon }: { pylon: ActorSubclass }) =>
    await fetchMeta({
      pylon: pylon as unknown as ActorSubclass<NeuronPylon>,
    })
);

export default MetaSlice.reducer;
