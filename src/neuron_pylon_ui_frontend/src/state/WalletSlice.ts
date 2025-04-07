import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWallet } from "@/client/fetchWallet";
import { Principal } from "@dfinity/principal";
import { ActorSubclass } from "@dfinity/agent";
import {
  _SERVICE as NeuronPylon,
  AccountEndpoint,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";

type WalletState = {
  pylon_account: AccountEndpoint[];
  logged_in: boolean;
  principal: string;
  status: string;
  error: string | null;
  actors: Record<string, ActorSubclass>;
};

const initialState: WalletState = {
  pylon_account: [],
  logged_in: false,
  principal: "",
  actors: {},
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
        state.logged_in = action.payload.logged_in;
        state.principal = action.payload.principal;
        state.actors = action.payload.actors;
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
    shouldRegister,
    logout,
    actors,
  }: {
    principal: Principal;
    pylon: ActorSubclass;
    shouldRegister: boolean;
    logout: () => Promise<void>;
    actors: Record<string, ActorSubclass>;
  }) =>
    await fetchWallet({
      principal: principal,
      pylon: pylon as unknown as ActorSubclass<NeuronPylon>,
      shouldRegister: shouldRegister,
      logout: logout,
      actors: actors,
    })
);

export default WalletSlice.reducer;
