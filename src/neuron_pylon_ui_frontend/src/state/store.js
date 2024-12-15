import { configureStore } from "@reduxjs/toolkit";
import Profile from "./ProfileSlice";

const store = configureStore({
  reducer: { Profile },
});

export default store;
