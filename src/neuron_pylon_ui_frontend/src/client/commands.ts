import { ActorSubclass } from "@dfinity/agent";
import {
  _SERVICE as NeuronPylon,
  BatchCommandRequest,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { accountToString, stringToIcrcAccount } from "@/utils/AccountTools";
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
}): Promise<void> => {
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

export const search = async ({
  pylon,
  query,
}: {
  pylon: ActorSubclass;
  query: string;
}): Promise<string> => {
  const neuronPylon = pylon as unknown as ActorSubclass<NeuronPylon>;
  let finalQuery: string = "";

  if (query && Number.isFinite(Number(query))) {
    const nodeRes = await neuronPylon.icrc55_get_nodes([{ id: Number(query) }]);

    const node = nodeRes[0][0];

    if (node) {
      const controller = accountToString(node.controllers[0]);

      finalQuery = `/vectors/${controller}/${node.id}`;
    } else {
      throw new Error("Vector ID not found!");
    }
  } else if (query) {
    const controller = stringToIcrcAccount(query);

    const nodes = await neuronPylon.icrc55_get_controller_nodes({
      id: controller,
      start: 0,
      length: 100,
    });

    if (nodes.length > 0) {
      finalQuery = `/vectors/${query}`;
    } else {
      throw new Error("Vector controller not found!");
    }
  }

  return finalQuery;
};
