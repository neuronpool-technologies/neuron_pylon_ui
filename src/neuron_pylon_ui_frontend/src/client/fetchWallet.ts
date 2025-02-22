import { Principal } from "@dfinity/principal";
import { ActorSubclass } from "@dfinity/agent";
import { stringToIcrcAccount } from "@/utils/AccountTools";
import {
  _SERVICE as NeuronPylon,
  AccountsResponse,
  NodeShared,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { toaster } from "@/components/ui/toaster";

type FetchWalletResp = {
  pylon_account: AccountsResponse;
  vectors: NodeShared[];
};

export const fetchWallet = async ({
  pylon,
  principal,
}: {
  pylon: ActorSubclass<NeuronPylon>;
  principal: Principal;
}): Promise<FetchWalletResp> => {
  try {
    const account = stringToIcrcAccount(principal.toString());
    // Run both requests in parallel
    const [icrcRes, nodes] = await Promise.all([
      pylon.icrc55_accounts(account),
      pylon.icrc55_get_controller_nodes({
        id: account,
        start: 0,
        length: 100,
      }),
    ]);

    pylon.icrc55_account_register(account);

    return {
      pylon_account: icrcRes,
      vectors: nodes,
    };
  } catch (error) {
    console.error(error);

    toaster.create({
      title: "Error fetching wallet information",
      description: `${String(error).substring(0, 200)}...`,
      type: "warning",
    });

    return {
      pylon_account: [],
      vectors: [],
    };
  }
};

export default fetchWallet;
