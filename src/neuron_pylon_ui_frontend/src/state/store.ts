import { configureStore } from "@reduxjs/toolkit";
import Wallet from "./WalletSlice";
import Meta from "./MetaSlice";
import Vectors from "./VectorsSlice";

const store = configureStore({
  reducer: { Wallet, Meta, Vectors },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
