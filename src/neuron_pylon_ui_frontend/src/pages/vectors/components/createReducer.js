// TODO add more create node options such as billing option, refund account etc

export const initialCreateState = {
  destination_maturity: "",
  destination_disburse: "",
  neuron_delay: "",
  neuron_followee: "",
};

export const createReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_NODE": {
      return {
        ...state,
        [action.field]: action.value,
      };
    }
      case "CLEAR_NODE": {
        return initialCreateState;
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
};
