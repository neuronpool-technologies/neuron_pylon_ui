import { configureStore } from "@reduxjs/toolkit";
import Wallet from "./WalletSlice";
import Meta from "./MetaSlice";
import Vectors from "./VectorsSlice";

const store = configureStore({
  reducer: { Wallet, Meta, Vectors },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ["Wallet", "Meta", "Vectors"],
        ignoredActions: [
          "wallet/refreshWallet/fulfilled",
          "meta/refreshMeta/fulfilled",
          "vectors/refreshVectors/fulfilled",
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
