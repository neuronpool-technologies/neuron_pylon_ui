import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { InitBilling } from "../client/data/InitBilling";

const BillingSlice = createSlice({
  name: "billing",
  initialState: {
    something: "",
    status: "idle",
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBillingInformation.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBillingInformation.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.something = action.payload.something;
      })
      .addCase(fetchBillingInformation.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const fetchBillingInformation = createAsyncThunk(
  "billing/fetchBillingInformation",
  async () => await InitBilling()
);

export default BillingSlice.reducer;
