import { Principal } from "@dfinity/principal";
import { ActorSubclass } from "@dfinity/agent";
import { stringToIcrcAccount } from "@/utils/AccountTools";
import {
  _SERVICE as NeuronPylon,
  AccountsResponse,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { toaster } from "@/components/ui/toaster";

type FetchWalletResp = {
  pylon_account: AccountsResponse;
  logged_in: boolean;
  principal: string;
};

export const fetchWallet = async ({
  pylon,
  principal,
  shouldRegister,
}: {
  pylon: ActorSubclass<NeuronPylon>;
  principal: Principal;
  shouldRegister: boolean;
}): Promise<FetchWalletResp> => {
  try {
    const account = stringToIcrcAccount(principal.toString());

    // Run both requests in parallel
    const [icrcRes] = await Promise.all([pylon.icrc55_accounts(account)]);

    // Only register when explicitly requested (first call)
    if (shouldRegister) {
      void pylon.icrc55_account_register(account).catch(() => {});
    }

    return {
      pylon_account: icrcRes,
      logged_in: true,
      principal: principal.toString(),
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
      logged_in: false,
      principal: "",
    };
  }
};

export default fetchWallet;
