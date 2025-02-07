import { startNeuronPylonClient } from "../Client";
import { Principal } from "@dfinity/principal";
import {
  encodeIcrcAccount,
  decodeIcrcAccount,
  IcrcAccount,
} from "@dfinity/ledger-icrc";
import { showToast } from "@/tools/toast";
import { deepConvertToString } from "@/tools/conversions";

type InitWalletResp = {
  ntn_address: string;
  ntn_balance: string;
  ntn_ledger: string;
  vectors: Array<any>;
};

export const InitWallet = async ({
  principal,
}: {
  principal: string;
}): Promise<InitWalletResp> => {
  try {
    const pylon = await startNeuronPylonClient();

    // Decode the principal for reuse
    const accountController: IcrcAccount = decodeIcrcAccount(principal);

    // Run both requests in parallel
    const [icrcRes, nodes] = await Promise.all([
      pylon.icrc55_accounts({
        owner: Principal.fromText(principal),
        subaccount: [],
      }),
      pylon.icrc55_get_controller_nodes({
        id: {
          owner: accountController.owner,
          subaccount: accountController.subaccount
            ? [accountController.subaccount]
            : [],
        },
        start: 0,
        length: 100,
      }),
    ]);

    // Extract the relevant data
    const [{ balance, endpoint }] = icrcRes;

    if (!("ic" in endpoint)) {
      throw new Error('"ic" property is missing from the endpoint object.');
    }

    return {
      ntn_address: encodeIcrcAccount({
        owner: endpoint.ic.account.owner,
        subaccount: endpoint.ic.account.subaccount[0],
      }),
      ntn_balance: balance.toString(),
      ntn_ledger: endpoint.ic.ledger.toString(),
      vectors: deepConvertToString(nodes),
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
      vectors: [],
    };
  }
};
