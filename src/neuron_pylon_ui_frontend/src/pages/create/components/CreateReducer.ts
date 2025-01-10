type CreateState = {
  maturityDestination: string;
  disburseDestination: string;
  billingOption: number;
  dissolveDelay: number;
  followee: string;
  initialCreateBalance: string;
};

type UpdatePayload<K extends keyof CreateState> = {
  key: K;
  value: CreateState[K];
};

type CreateAction =
  | { type: "UPDATE_STATE"; payload: UpdatePayload<keyof CreateState> }
  | { type: "RESET" };

export const initialCreateState: CreateState = {
  maturityDestination: "",
  disburseDestination: "",
  billingOption: 0,
  dissolveDelay: 184,
  followee: "Default",
  initialCreateBalance: "",
};

export const createReducer = (
  state: CreateState,
  action: CreateAction
): CreateState => {
  switch (action.type) {
    case "UPDATE_STATE":
      const { key, value } = action.payload;
      return {
        ...state,
        [key]: value,
      };
    case "RESET":
      return initialCreateState;
  }
};
