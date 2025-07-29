import { ActorSubclass } from "@dfinity/agent";
import {
  _SERVICE as NeuronPylon,
  BatchCommandRequest,
  ModifyNodeRequest,
  CreateNodeRequest,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { accountToString, stringToIcrcAccount } from "@/utils/AccountTools";
import { icpToE8s } from "@/utils/TokenTools";
import { match, P } from "ts-pattern";

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
          memo: [],
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

export const modify = async ({
  pylon,
  controller,
  modReq,
}: {
  pylon: ActorSubclass;
  controller: string;
  modReq: ModifyNodeRequest;
}): Promise<void> => {
  const neuronPylon = pylon as unknown as ActorSubclass<NeuronPylon>;
  const vectorOwner = stringToIcrcAccount(controller);

  const modifyArgs: BatchCommandRequest = {
    expire_at: [],
    request_id: [],
    controller: vectorOwner,
    signature: [],
    commands: [{ modify_node: modReq }],
  };

  await neuronPylon.icrc55_command(modifyArgs);
};

export const destroy = async ({
  pylon,
  controller,
  nodeId,
}: {
  pylon: ActorSubclass;
  controller: string;
  nodeId: number;
}): Promise<void> => {
  const neuronPylon = pylon as unknown as ActorSubclass<NeuronPylon>;
  const vectorOwner = stringToIcrcAccount(controller);

  const modifyArgs: BatchCommandRequest = {
    expire_at: [],
    request_id: [],
    controller: vectorOwner,
    signature: [],
    commands: [{ delete_node: nodeId }],
  };

  await neuronPylon.icrc55_command(modifyArgs);
};

export const create = async ({
  pylon,
  controller,
  createReq,
}: {
  pylon: ActorSubclass;
  controller: string;
  createReq: CreateNodeRequest;
}): Promise<number> => {
  const neuronPylon = pylon as unknown as ActorSubclass<NeuronPylon>;
  const vectorOwner = stringToIcrcAccount(controller);

  const createArgs: BatchCommandRequest = {
    expire_at: [],
    request_id: [],
    controller: vectorOwner,
    signature: [],
    commands: [{ create_node: createReq }],
  };

  const res = await neuronPylon.icrc55_command(createArgs);

  return match(res)
    .with({ ok: P.select() }, (ok) => {
      // Check if we have command responses
      if (ok.commands.length > 0) {
        // Extract the first create_node response
        const createNodeRes = ok.commands[0];
        if ("create_node" in createNodeRes) {
          // Access the node ID from the GetNodeResponse
          if ("ok" in createNodeRes.create_node) {
            return Number(createNodeRes.create_node.ok.id);
          }
        }
      }
      throw new Error("Vector created successfully but no ID was returned");
    })
    .otherwise(() => {
      throw new Error("Failed to create vector");
    });
};
