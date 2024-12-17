import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { InitMeta } from "../client/data/InitMeta";

const MetaSlice = createSlice({
  name: "meta",
  initialState: {
    name: "",
    governed_by: "",
    billing: "",
    modules: "",
    status: "idle",
    error: null,
  },
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
