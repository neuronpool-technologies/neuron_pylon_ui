import { configureStore } from "@reduxjs/toolkit";
import Profile from "./ProfileSlice";
import Meta from "./MetaSlice";

const store = configureStore({
  reducer: { Profile, Meta },
});

export default store;
