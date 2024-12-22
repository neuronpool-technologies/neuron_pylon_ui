import { startNeuronPylonClient } from "../Client";
import { Principal } from "@dfinity/principal";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { showToast } from "@/tools/toast";

type InitWalletResp = {
  ntn_address: string,
  ntn_balance: string,
  ntn_ledger: string,
};

export const InitWallet = async ({ principal }: { principal: string }) : Promise<InitWalletResp> => {
  try {
    const pylon = await startNeuronPylonClient();

    let [{ balance, endpoint }] = await pylon.icrc55_accounts({
      owner: Principal.fromText(principal),
      subaccount: [],
    });

    if(!("ic" in endpoint)){
      throw new Error('"ic" property is missing from the endpoint object.');
    };
    
    return {
      ntn_address: encodeIcrcAccount({
        owner: endpoint.ic.account.owner,
        subaccount: endpoint.ic.account.subaccount[0],
      }),
      ntn_balance: balance.toString(),
      ntn_ledger: endpoint.ic.ledger.toString(),
    };
  } catch (error) {
    console.error(error);

    showToast({
      title: "Error fetching wallet information",
      description: `${error.toString().substring(0, 200)}...`,
      status: "warning",
    });

    return {
      ntn_address: "",
      ntn_balance: "",
      ntn_ledger: "",
    };
  }
};
