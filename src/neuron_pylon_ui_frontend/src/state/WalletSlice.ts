import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWallet } from "@/client/fetchWallet";
import { Principal } from "@dfinity/principal";
import { ActorSubclass } from "@dfinity/agent";
import {
  _SERVICE as NeuronPylon,
  AccountEndpoint,
  NodeShared,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";

type WalletState = {
  pylon_account: AccountEndpoint[];
  status: string;
  error: string | null;
};

const initialState: WalletState = {
  pylon_account: [],
  status: "idle",
  error: null,
};

const WalletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setCleanup: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshWallet.pending, (state) => {
        state.status = "loading";
      })
      .addCase(refreshWallet.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.pylon_account = action.payload.pylon_account;
      })
      .addCase(refreshWallet.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      });
  },
});

export const { setCleanup } = WalletSlice.actions;

export const refreshWallet = createAsyncThunk(
  "wallet/refreshWallet",
  async ({
    principal,
    pylon,
  }: {
    principal: Principal;
    pylon: ActorSubclass;
  }) => await fetchWallet({ principal : principal, pylon: pylon as unknown as ActorSubclass<NeuronPylon> })
);

export default WalletSlice.reducer;
