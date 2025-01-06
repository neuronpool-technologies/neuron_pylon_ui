import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { InitWallet } from "../client/data/InitWallet";
import { NodeShared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";

type ProfileState = {
  logged_in: boolean;
  principal: string;
  ntn_address: string;
  ntn_balance: string;
  ntn_ledger: string;
  vectors : Array<any>;
  status: string;
  error: string | null;
};

const initialState: ProfileState = {
  logged_in: false,
  principal: "",
  ntn_address: "",
  ntn_balance: "",
  ntn_ledger: "",
  vectors : [],
  status: "idle",
  error: null,
};

const ProfileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setLogin: (state) => {
      state.logged_in = true;
    },
    setLogout: () => initialState,
    setPrincipal: (state, action) => {
      state.principal = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.ntn_address = action.payload.ntn_address;
        state.ntn_balance = action.payload.ntn_balance;
        state.ntn_ledger = action.payload.ntn_ledger;
        state.vectors = action.payload.vectors;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { setLogin, setLogout, setPrincipal } = ProfileSlice.actions;

export const fetchWallet = createAsyncThunk(
  "profile/fetchWallet",
  async ({ principal }: { principal: string }) =>
    await InitWallet({ principal })
);

export default ProfileSlice.reducer;
