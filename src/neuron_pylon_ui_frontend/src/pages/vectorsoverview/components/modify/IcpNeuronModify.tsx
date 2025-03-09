import { useState } from "react";
import { Flex, Input, Spacer } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { BiSave } from "react-icons/bi";
import { isAccountOkay, stringToIcrcAccount } from "@/utils/AccountTools";
import {
  NodeShared,
  PylonMetaResp,
  ModifyRequest,
} from "@/declarations/neuron_pylon/neuron_pylon.did";
import { extractNodeType } from "@/utils/Node";
import { useActors } from "@/hooks/useActors";
import { modify } from "@/client/commands";
import { useTypedSelector } from "@/hooks/useRedux";
import { CommonModifyRequest } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { ConfirmDialog, StatBox, StatRow } from "@/components";
import { e8sToIcp } from "@/utils/TokenTools";
import { toaster } from "@/components/ui/toaster";

const IcpNeuronModify = ({
  vector,
  meta,
}: {
  vector: NodeShared;
  meta: PylonMetaResp;
}) => {
  const { principal } = useTypedSelector((state) => state.Wallet);
  const { destinations } = extractNodeType(vector, meta);
  const [saving, setSaving] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const { actors } = useActors();

  const [modifyState, setModifyState] = useState({
    maturityDestination: destinations[0][1],
    disburseDestination: destinations[1][1],
    followee: "",
    dissolveDelayDays: "",
  });

  const saveChanges = async () => {
    setSaving(true);

    const commonEditRequest: CommonModifyRequest = {
      active: [],
      controllers: [],
      extractors: [],
      destinations: [
        [
          [{ ic: stringToIcrcAccount(modifyState.maturityDestination) }],
          [{ ic: stringToIcrcAccount(modifyState.disburseDestination) }],
        ],
      ],
      sources: [],
      refund: [],
    };

    const editRequest: ModifyRequest = {
      devefi_jes1_icpneuron: {
        dissolve_delay: [{ DelayDays: BigInt(modifyState.dissolveDelayDays) }],
        dissolve_status: [],
        followee: [{ FolloweeId: BigInt(modifyState.followee) }],
      },
    };

    await modify({
      pylon: actors.neuronPylon,
      controller: principal,
      modReq: [vector.id, [commonEditRequest], [editRequest]],
    }).finally(() => {
      setSaving(false);
      setOpen(false);
    });
  };

  const confirm = async () => {
    const promise = saveChanges();

    toaster.promise(promise, {
      success: {
        title: `Vector #${vector.id} modified`,
        duration: 3000,
      },
      error: {
        title: "Transaction failed",
        description: "Please try again.",
        duration: 3000,
      },
      loading: { title: `Modifying vector #${vector.id}` },
    });
  };

  return (
    <Flex align="center" direction={"column"} w="100%" gap={6}>
      <Flex direction={{ base: "column", md: "row" }} gap={3} w="100%">
        <Field
          label={"Maturity destination"}
          invalid={!isAccountOkay(modifyState.maturityDestination)}
          disabled={saving}
        >
          <Input
            placeholder="Principal, ICRC (e.g., ntohy-uex..., ...)"
            size="lg"
            bg={
              !isAccountOkay(modifyState.maturityDestination) ? "bg.error" : ""
            }
            onChange={(e) =>
              setModifyState((prevState) => ({
                ...prevState,
                maturityDestination: e.target.value,
              }))
            }
            value={modifyState.maturityDestination}
          />
        </Field>
        <Field label={"Disburse destination"}>
          <Input
            placeholder="Principal, ICRC (e.g., ntohy-uex..., ...)"
            size="lg"
            bg={
              !isAccountOkay(modifyState.disburseDestination) ? "bg.error" : ""
            }
            onChange={(e) =>
              setModifyState((prevState) => ({
                ...prevState,
                disburseDestination: e.target.value,
              }))
            }
            value={modifyState.disburseDestination}
          />
        </Field>
      </Flex>
      <Flex direction={{ base: "column", md: "row" }} gap={3} w="100%">
        <Field
          label={"Followee"}
          invalid={!isAccountOkay(modifyState.maturityDestination)}
          disabled={saving}
        >
          <Input
            placeholder="Principal, ICRC (e.g., ntohy-uex..., ...)"
            size="lg"
            bg={
              !isAccountOkay(modifyState.maturityDestination) ? "bg.error" : ""
            }
            onChange={(e) =>
              setModifyState((prevState) => ({
                ...prevState,
                maturityDestination: e.target.value,
              }))
            }
            value={modifyState.maturityDestination}
          />
        </Field>
        {/* TODO add a max button here to help users out */}
        <Field label={"Dissolve delay (days)"}>
          <Input
            placeholder="Principal, ICRC (e.g., ntohy-uex..., ...)"
            size="lg"
            bg={
              !isAccountOkay(modifyState.disburseDestination) ? "bg.error" : ""
            }
            onChange={(e) =>
              setModifyState((prevState) => ({
                ...prevState,
                disburseDestination: e.target.value,
              }))
            }
            value={modifyState.disburseDestination}
          />
        </Field>
      </Flex>
      <Flex align="center" w="100%">
        <Spacer />
        <Flex w={{ base: "100%", md: "auto" }}>
          <ConfirmDialog
            confirmTitle={"Save changes"}
            openDisabled={false}
            buttonIcon={<BiSave />}
            isOpen={open}
            setOpen={setOpen}
            onConfirm={confirm}
            loading={saving}
          >
            <Flex w="100%" gap={3} direction={"column"}>
              <StatBox
                title={`${destinations[0][0]} destination`}
                bg={"bg"}
                fontSize="md"
                value={`${modifyState.maturityDestination}`}
              />
              <StatBox
                title={`${destinations[1][0]} destination`}
                bg={"bg"}
                fontSize="md"
                value={`${modifyState.disburseDestination}`}
              />
              <StatRow title={`Vector #${vector.id}`} stat={"Modify"} />
              <StatRow
                title={"Billing fees"}
                stat={`${e8sToIcp(Number(meta.billing.operation_cost)).toFixed(
                  4
                )} NTN`}
              />
            </Flex>
          </ConfirmDialog>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default IcpNeuronModify;
