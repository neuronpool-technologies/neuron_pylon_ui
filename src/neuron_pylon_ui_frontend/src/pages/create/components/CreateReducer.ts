type CreateState = {
  isCreated: boolean;
  isError: string;
  isCreating: boolean;
  maturityDestination: string;
  disburseDestination: string;
  billingOption: number;
  dissolveDelay: number;
  customDelay: boolean;
  followee: string;
  customFollowee: boolean;
  initialCreateBalance: string;
};

type CreateAction =
  | { type: "SET_IS_CREATED"; payload: boolean }
  | { type: "SET_IS_ERROR"; payload: string }
  | { type: "SET_IS_CREATING"; payload: boolean }
  | { type: "SET_MATURITY_DESTINATION"; payload: string }
  | { type: "SET_DISBURSE_DESTINATION"; payload: string }
  | { type: "SET_BILLING_OPTION"; payload: number }
  | { type: "SET_DISSOLVE_DELAY"; payload: number }
  | { type: "SET_CUSTOM_DELAY"; payload: boolean }
  | { type: "SET_FOLLOWEE"; payload: string }
  | { type: "SET_CUSTOM_FOLLOWEE"; payload: boolean }
  | { type: "SET_INITIAL_CREATE_BALANCE"; payload: string }
  | { type: "RESET" };

export const initialCreateState: CreateState = {
  isCreated: false,
  isError: "",
  isCreating: false,
  maturityDestination: "",
  disburseDestination: "",
  billingOption: 0,
  dissolveDelay: 184,
  customDelay: false,
  followee: "Default",
  customFollowee: false,
  initialCreateBalance: "",
};

export const createReducer = (
  state: CreateState,
  action: CreateAction
): CreateState => {
  switch (action.type) {
    case "SET_IS_CREATED":
      return { ...state, isCreated: action.payload };
    case "SET_IS_ERROR":
      return { ...state, isError: action.payload };
    case "SET_IS_CREATING":
      return { ...state, isCreating: action.payload };
    case "SET_MATURITY_DESTINATION":
      return { ...state, maturityDestination: action.payload };
    case "SET_DISBURSE_DESTINATION":
      return { ...state, disburseDestination: action.payload };
    case "SET_BILLING_OPTION":
      return { ...state, billingOption: action.payload };
    case "SET_DISSOLVE_DELAY":
      return { ...state, dissolveDelay: action.payload };
    case "SET_CUSTOM_DELAY":
      return { ...state, customDelay: action.payload };
    case "SET_FOLLOWEE":
      return { ...state, followee: action.payload };
    case "SET_CUSTOM_FOLLOWEE":
      return { ...state, customFollowee: action.payload };
    case "SET_INITIAL_CREATE_BALANCE":
      return { ...state, initialCreateBalance: action.payload };
    case "RESET":
      return initialCreateState;
  }
};
