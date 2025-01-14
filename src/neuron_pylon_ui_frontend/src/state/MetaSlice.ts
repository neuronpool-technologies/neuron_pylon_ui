import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { InitMeta } from "../client/data/InitMeta";
import {
  BillingPylon,
  ModuleMeta,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";

type MetaState = {
  name: string;
  governed_by: string;
  billing: BillingPylon | {};
  modules: ModuleMeta[] | [];
  total_vectors: string;
  total_stake: string;
  total_maturity: string;
  status: string;
  error: string | null;
};

const MetaSlice = createSlice({
  name: "meta",
  initialState: {
    name: "",
    governed_by: "",
    billing: "",
    modules: [],
    total_vectors: "",
    total_stake: "",
    total_maturity: "",
    status: "idle",
    error: null,
  } as MetaState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetaInformation.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMetaInformation.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.name = action.payload.name;
        state.governed_by = action.payload.governed_by;
        state.billing = action.payload.billing;
        state.modules = action.payload.modules;
        state.total_vectors = action.payload.total_vectors;
        state.total_stake = action.payload.total_stake;
        state.total_maturity = action.payload.total_maturity;
      })
      .addCase(fetchMetaInformation.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const fetchMetaInformation = createAsyncThunk(
  "meta/fetchMetaInformation",
  async () => await InitMeta()
);

export default MetaSlice.reducer;
