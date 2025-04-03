import { toaster } from "@/components/ui/toaster";
import {
  NodeShared,
  PylonMetaResp,
} from "@/declarations/neuron_pylon/neuron_pylon.did";
import { IconButton, Button, Flex } from "@chakra-ui/react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { BiTrash } from "react-icons/bi";
import { destroy } from "@/client/commands";
import { useActors } from "@/hooks/useActors";
import { StatBox, StatRow } from "@/components";
import { accountToString } from "@/utils/AccountTools";
import { extractNodeType } from "@/utils/Node";
import { e8sToIcp } from "@/utils/TokenTools";
import { useNavigate } from "react-router-dom";

const Delete = ({
  principal,
  controller,
  vector,
  meta,
}: {
  principal: string;
  controller: string;
  vector: NodeShared;
  meta: PylonMetaResp;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const navigate = useNavigate();

  const refundAccount = accountToString(vector.refund);
  const { billing } = extractNodeType(vector, meta);

  const billingTokenInfo = meta?.supported_ledgers.find((ledger) => {
    if (!("ic" in ledger?.ledger)) return false;
    return ledger?.ledger.ic.toString() === billing.ledger;
  });

  if (!billingTokenInfo) return null;

  const { actors } = useActors();

  const deleteNode = async () => {
    setDeleting(true);

    await destroy({
      pylon: actors.neuronPylon,
      controller: controller,
      nodeId: vector.id,
    }).finally(() => {
      setDeleting(false);
      setOpen(false);
      navigate(`/vectors/${controller}`);
    });
  };

  const confirm = async () => {
    const promise = deleteNode();

    toaster.promise(promise, {
      success: {
        title: `Vector #${vector.id} deleted`,
        duration: 3000,
      },
      error: {
        title: "Delete failed",
        description: "Please try again.",
        duration: 3000,
      },
      loading: { title: `Deleting vector #${vector.id}` },
    });
  };
  return (
    <DialogRoot
      lazyMount
      placement={"center"}
      motionPreset="slide-in-bottom"
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <DialogTrigger asChild>
        <IconButton
          aria-label="Delete vector"
          variant="surface"
          rounded="md"
          boxShadow="xs"
          colorPalette={"red"}
          size="xs"
          disabled={principal !== controller}
        >
          <BiTrash />
        </IconButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Flex w="100%" gap={3} direction={"column"}>
            <StatBox
              title={"Delete"}
              bg={"bg.panel"}
              fontSize="md"
              value={`Vector #${vector.id}`}
            />
            <StatRow
              title={"Refund to"}
              stat={`${refundAccount.slice(0, 7)}...${refundAccount.slice(-6)}`}
            />
            <StatRow
              title={"Refund amount"}
              stat={`${e8sToIcp(Number(billing.current_balance)).toFixed(4)} ${
                billingTokenInfo.symbol
              }`}
            />
          </Flex>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="surface"
            colorPalette={"red"}
            rounded="md"
            boxShadow="xs"
            w="100%"
            onClick={confirm}
            loading={deleting}
          >
            <BiTrash />
            Confirm Delete
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default Delete;
