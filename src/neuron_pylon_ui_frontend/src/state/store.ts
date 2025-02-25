import { configureStore } from "@reduxjs/toolkit";
import Wallet from "./WalletSlice";
import Meta from "./MetaSlice";
import Stats from "./StatsSlice";

const store = configureStore({
  reducer: { Wallet, Meta, Stats },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ["Wallet", "Meta"],
        ignoredActions: [
          "wallet/refreshWallet/fulfilled",
          "meta/refreshMeta/fulfilled",
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
