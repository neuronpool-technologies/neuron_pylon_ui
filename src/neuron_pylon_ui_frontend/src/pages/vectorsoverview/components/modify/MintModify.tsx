import { useEffect, useState, useMemo } from "react";
import {
  Flex,
  Input,
  Separator,
  Spacer,
  Heading,
  Highlight,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { BiSave } from "react-icons/bi";
import {
  accountToString,
  isAccountOkay,
  stringToIcrcAccount,
} from "@/utils/AccountTools";
import {
  NodeShared,
  PylonMetaResp,
  ModifyRequest,
} from "@/declarations/neuron_pylon/neuron_pylon.did";
import { extractNodeType } from "@/utils/Node";
import { modify } from "@/client/commands";
import { useTypedSelector } from "@/hooks/useRedux";
import { CommonModifyRequest } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { ConfirmDialog, StatBox, StatRow } from "@/components";
import { e8sToIcp } from "@/utils/TokenTools";
import { toaster } from "@/components/ui/toaster";
import { ActorSubclass } from "@dfinity/agent";

const MintModify = ({
  vector,
  meta,
  actors,
}: {
  vector: NodeShared;
  meta: PylonMetaResp;
  actors: Record<string, ActorSubclass>;
}) => {
  const { principal } = useTypedSelector((state) => state.Wallet);
  const { destinations, controller } = extractNodeType(vector, meta);
  const [saving, setSaving] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const refundAccount = accountToString(vector.refund);
  const [modifyState, setModifyState] = useState({
    destination: destinations[0][1],
    controller: controller,
    refund: refundAccount,
  });

  const saveChanges = async () => {
    setSaving(true);

    const commonEditRequest: CommonModifyRequest = {
      active: [],
      controllers: [[stringToIcrcAccount(modifyState.controller)]],
      extractors: [],
      destinations: [
        [
          [{ ic: stringToIcrcAccount(modifyState.destination) }],
        ],
      ],
      sources: [],
      refund: [stringToIcrcAccount(modifyState.refund)],
    };

    const editRequest: ModifyRequest = {
      devefi_jes1_ntc_mint: {},
    };

    await modify({
      pylon: actors.neuronPylon,
      controller: principal,
      modReq: [vector.id, [commonEditRequest], [editRequest]],
    }).finally(() => {
      setHasUnsavedChanges(false);
    });
  };

  const confirm = async () => {
    const promise = saveChanges();

    toaster.promise(promise, {
      success: {
        title: `Vector #${vector.id} modified`,
        duration: 3000,
      },
      error: (error) => ({
        title: "Modify failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        duration: 3000,
      }),
      loading: { title: `Modifying vector #${vector.id}` },
      finally: () => {
        setSaving(false);
        setOpen(false);
      },
    });
  };

  const diffChanges = useMemo(() => {
    const changes: { [key: string]: { from: any; to: any } } = {};

    if (modifyState.destination !== destinations[0][1]) {
      changes["destination"] = {
        from: destinations[0][1],
        to: modifyState.destination,
      };
    }
    if (modifyState.controller !== controller) {
      changes["controller"] = { from: controller, to: modifyState.controller };
    }
    if (modifyState.refund !== refundAccount) {
      changes["refund"] = { from: refundAccount, to: modifyState.refund };
    }

    return changes;
  }, [modifyState, destinations, controller, refundAccount]);

  useEffect(() => {
    setHasUnsavedChanges(Object.keys(diffChanges).length > 0);
  }, [diffChanges]);

  return (
    <Flex direction={"column"} gap={6}>
      <Flex
        align="start"
        direction={{ base: "column", md: "row" }}
        w="100%"
        gap={6}
      >
        <Flex direction={"column"} gap={3} w="100%">
          <Heading letterSpacing="tight" size={"lg"} lineClamp={1}>
            <Highlight
              query={"Destination"}
              styles={{
                px: "1",
                py: "1",
                color: "blue.fg",
              }}
            >
              Edit Destination
            </Highlight>
          </Heading>
          <Separator />
          <Field
            label={"To destination"}
            invalid={!isAccountOkay(modifyState.destination)}
            disabled={saving}
          >
            <Input
              placeholder="Principal, ICRC (e.g., ntohy-uex..., ...)"
              size="lg"
              bg={!isAccountOkay(modifyState.destination) ? "bg.error" : ""}
              onChange={(e) =>
                setModifyState((prevState) => ({
                  ...prevState,
                  destination: e.target.value,
                }))
              }
              value={modifyState.destination}
            />
          </Field>
        </Flex>
        <Flex direction={"column"} gap={3} w="100%">
          <Heading letterSpacing="tight" size={"lg"} lineClamp={1}>
            <Highlight
              query={"Owner"}
              styles={{
                px: "1",
                py: "1",
                color: "blue.fg",
              }}
            >
              Edit Owner
            </Highlight>
          </Heading>
          <Separator />
          <Field
            label={"Owner"}
            invalid={!isAccountOkay(modifyState.controller)}
            disabled={saving}
          >
            <Input
              placeholder="Principal, ICRC (e.g., ntohy-uex..., ...)"
              size="lg"
              bg={!isAccountOkay(modifyState.controller) ? "bg.error" : ""}
              onChange={(e) =>
                setModifyState((prevState) => ({
                  ...prevState,
                  controller: e.target.value,
                }))
              }
              value={modifyState.controller}
            />
          </Field>
          <Field
            label={"Refund account"}
            invalid={!isAccountOkay(modifyState.refund)}
            disabled={saving}
          >
            <Input
              placeholder="Principal, ICRC (e.g., ntohy-uex..., ...)"
              size="lg"
              bg={!isAccountOkay(modifyState.refund) ? "bg.error" : ""}
              onChange={(e) =>
                setModifyState((prevState) => ({
                  ...prevState,
                  refund: e.target.value,
                }))
              }
              value={modifyState.refund}
            />
          </Field>
        </Flex>
      </Flex>
      <Flex
        align="center"
        direction={{ base: "column", md: "row" }}
        w="100%"
        gap={3}
      >
        <Spacer />
        {hasUnsavedChanges ? (
          <Flex fontWeight={500} color="fg.muted" fontSize="xs">
            You have unsaved changes!
          </Flex>
        ) : null}
        <Flex w={{ base: "100%", md: "auto" }}>
          <ConfirmDialog
            confirmTitle={"Save changes"}
            openDisabled={!hasUnsavedChanges}
            buttonIcon={<BiSave />}
            isOpen={open}
            setOpen={setOpen}
            onConfirm={confirm}
            loading={saving}
          >
            <Flex w="100%" gap={3} direction={"column"}>
              {hasUnsavedChanges && (
                <>
                  <Heading size="sm" color="blue.fg">
                    Changes to be applied:
                  </Heading>
                  {Object.entries(diffChanges).map(([key, value]) => (
                    <StatBox
                      key={key}
                      title={key.charAt(0).toUpperCase() + key.slice(1)}
                      bg={"bg.panel"}
                      fontSize="md"
                      value={`${(value as any).to}`}
                    />
                  ))}
                </>
              )}
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

export default MintModify;