import { Actor, HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { idlFactory as NeuronPylonCanisterIDL } from "../../../declarations/neuron_pylon/index";

const ICP_API = "https://icp-api.io";

export const startNeuronPylonClient = async () => {
  const canisterId = process.env.REACT_APP_NEURON_PYLON_CANISTER_ID;

  const authClient = await AuthClient.create();
  const identity = await authClient.getIdentity();

  return Actor.createActor(NeuronPylonCanisterIDL, {
    agent: new HttpAgent({
      identity,
      host: ICP_API,
    }),
    canisterId: canisterId,
  });
};