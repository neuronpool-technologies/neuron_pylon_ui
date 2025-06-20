import { idlFactory as NeuronPylonCanisterIDL } from "@/declarations/neuron_pylon/index";
import { idlFactory as RouterCanisterIDL } from "@/chrono/declarations/chrono_router/index";
import { useAuthClient } from "@dfinity/use-auth-client";

const ICP_API = "https://icp-api.io";

export const useActors = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const pylonCanisterId = process.env.REACT_APP_NEURON_PYLON_CANISTER_ID;
  const routerCanisterId = process.env.REACT_APP_ROUTER_CANISTER_ID;


  const { identity, isAuthenticated, login, logout, actors } = useAuthClient({
    loginOptions: {
      identityProvider: "https://identity.ic0.app/",
      derivationOrigin: isProduction
        ? `https://${process.env.REACT_APP_FRONTEND_CANISTER_ID}.icp0.io`
        : undefined,
    },
    actorOptions: {
      neuronPylon: {
        agentOptions: {
          host: ICP_API,
        },
        canisterId: pylonCanisterId ?? "",
        idlFactory: NeuronPylonCanisterIDL,
      },
      router: {
        agentOptions: {
          host: ICP_API,
        },
        canisterId: routerCanisterId ?? "",
        idlFactory: RouterCanisterIDL,
      },
    },
  });

  return { identity, isAuthenticated, login, logout, actors };
};
