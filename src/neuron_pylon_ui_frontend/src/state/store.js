import { configureStore } from "@reduxjs/toolkit";
import Profile from "./ProfileSlice";
import Billing from "./BillingSlice";

const store = configureStore({
  reducer: { Profile, Billing },
});

export default store;
