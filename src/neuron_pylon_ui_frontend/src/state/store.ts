import { configureStore } from "@reduxjs/toolkit";
import Wallet from "./WalletSlice";
import Meta from "./MetaSlice";

const store = configureStore({
  reducer: { Wallet, Meta },
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
