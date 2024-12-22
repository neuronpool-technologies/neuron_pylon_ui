import { Actor, HttpAgent, ActorSubclass } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { idlFactory as NeuronPylonCanisterIDL } from "@/declarations/neuron_pylon/index";
import {_SERVICE as NeuronPylon} from "@/declarations/neuron_pylon/neuron_pylon.did.js";

const ICP_API = "https://icp-api.io";

export const startNeuronPylonClient = async () : Promise<ActorSubclass<NeuronPylon>> => {
  const canisterId = process.env.REACT_APP_NEURON_PYLON_CANISTER_ID;

  const authClient = await AuthClient.create();
  const identity = authClient.getIdentity();

  return Actor.createActor(NeuronPylonCanisterIDL, {
    agent: await HttpAgent.create({
      identity,
      host: ICP_API,
    }),
    canisterId: canisterId,
  });
};