import { ActorSubclass } from "@dfinity/agent";
import {
  _SERVICE as NeuronPylon,
  BatchCommandRequest,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { stringToIcrcAccount } from "@/utils/AccountTools";
import { icpToE8s } from "@/utils/TokenTools";

export const transfer = async ({
  pylon,
  controller,
  ledger,
  to,
  amount,
}: {
  pylon: ActorSubclass;
  controller: string;
  ledger: string;
  to: string;
  amount: string;
}) => {
  const neuronPylon = pylon as unknown as ActorSubclass<NeuronPylon>;

  const tokenOwner = stringToIcrcAccount(controller);
  const tokenLedger = stringToIcrcAccount(ledger).owner;
  const tokenTo = stringToIcrcAccount(to);
  const tokenAmountE8s = icpToE8s(Number(amount));

  const transferArgs: BatchCommandRequest = {
    expire_at: [],
    request_id: [],
    controller: tokenOwner,
    signature: [],
    commands: [
      {
        transfer: {
          ledger: { ic: tokenLedger },
          from: {
            account: tokenOwner,
          },
          to: {
            external_account: {
              ic: tokenTo,
            },
          },
          amount: tokenAmountE8s,
        },
      },
    ],
  };

  await neuronPylon.icrc55_command(transferArgs);
};
