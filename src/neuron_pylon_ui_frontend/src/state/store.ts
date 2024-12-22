import { configureStore } from "@reduxjs/toolkit";
import Profile from "./ProfileSlice";
import Meta from "./MetaSlice";

const store = configureStore({
  reducer: { Profile, Meta },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
