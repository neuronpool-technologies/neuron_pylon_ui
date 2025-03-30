import { useEffect, useState, useMemo } from "react";
import {
  Flex,
  Input,
  Separator,
  Spacer,
  Heading,
  Highlight,
  RadioCard,
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
import { useActors } from "@/hooks/useActors";
import { modify } from "@/client/commands";
import { useTypedSelector } from "@/hooks/useRedux";
import { CommonModifyRequest } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { ConfirmDialog, StatBox, StatRow } from "@/components";
import { e8sToIcp } from "@/utils/TokenTools";
import { toaster } from "@/components/ui/toaster";
import { hexStringToUint8Array } from "@dfinity/utils";

const NeuronModify = ({
  vector,
  meta,
}: {
  vector: NodeShared;
  meta: PylonMetaResp;
}) => {
  const { principal } = useTypedSelector((state) => state.Wallet);
  const {
    symbol,
    destinations,
    controller,
    varFollowee,
    varDissolve,
    varDelay,
  } = extractNodeType(vector, meta);
  const [saving, setSaving] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { actors } = useActors();

  const refundAccount = accountToString(vector.refund);
  const [modifyState, setModifyState] = useState({
    maturity: destinations[0][1],
    disburse: destinations[1][1],
    controller: controller,
    refund: refundAccount,
    followee: varFollowee ?? "",
    status: varDissolve ?? "",
    delay: varDelay ?? "",
  });

  const saveChanges = async () => {
    setSaving(true);

    const commonEditRequest: CommonModifyRequest = {
      active: [],
      controllers: [[stringToIcrcAccount(modifyState.controller)]],
      extractors: [],
      destinations: [
        [
          [{ ic: stringToIcrcAccount(modifyState.maturity) }],
          [{ ic: stringToIcrcAccount(modifyState.disburse) }],
        ],
      ],
      sources: [],
      refund: [stringToIcrcAccount(modifyState.refund)],
    };

    const editRequest: ModifyRequest =
      symbol === "ICP"
        ? {
            devefi_jes1_icpneuron: {
              dissolve_delay: [{ DelayDays: BigInt(modifyState.delay) }],
              dissolve_status: [
                modifyState.status === "Locked"
                  ? { Locked: null }
                  : { Dissolving: null },
              ],
              followee: [{ FolloweeId: BigInt(modifyState.followee) }],
            },
          }
        : {
            devefi_jes1_snsneuron: {
              dissolve_delay: [{ DelayDays: BigInt(modifyState.delay) }],
              dissolve_status: [
                modifyState.status === "Locked"
                  ? { Locked: null }
                  : { Dissolving: null },
              ],
              followee: [
                { FolloweeId: hexStringToUint8Array(modifyState.followee) },
              ],
            },
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

    if (modifyState.maturity !== destinations[0][1]) {
      changes["maturity"] = {
        from: destinations[0][1],
        to: modifyState.maturity,
      };
    }
    if (modifyState.disburse !== destinations[1][1]) {
      changes["disburse"] = {
        from: destinations[1][1],
        to: modifyState.disburse,
      };
    }
    if (modifyState.controller !== controller) {
      changes["controller"] = { from: controller, to: modifyState.controller };
    }
    if (modifyState.refund !== refundAccount) {
      changes["refund"] = { from: refundAccount, to: modifyState.refund };
    }
    if (modifyState.followee !== varFollowee) {
      changes["followee"] = { from: varFollowee, to: modifyState.followee };
    }
    if (modifyState.status !== varDissolve) {
      changes["status"] = { from: varDissolve, to: modifyState.status };
    }
    if (modifyState.delay !== varDelay) {
      changes["delay"] = { from: varDelay, to: modifyState.delay };
    }

    return changes;
  }, [
    modifyState,
    destinations,
    controller,
    refundAccount,
    varFollowee,
    varDissolve,
    varDelay,
  ]);

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
              query={"Destinations"}
              styles={{
                px: "1",
                py: "1",
                color: "blue.fg",
              }}
            >
              Edit Destinations
            </Highlight>
          </Heading>
          <Separator />
          <Field
            label={"Maturity destination"}
            invalid={!isAccountOkay(modifyState.maturity)}
            disabled={saving}
          >
            <Input
              placeholder="Principal, ICRC (e.g., ntohy-uex..., ...)"
              size="lg"
              bg={!isAccountOkay(modifyState.maturity) ? "bg.error" : ""}
              onChange={(e) =>
                setModifyState((prevState) => ({
                  ...prevState,
                  maturity: e.target.value,
                }))
              }
              value={modifyState.maturity}
            />
          </Field>
          <Field
            label={"Disburse destination"}
            invalid={!isAccountOkay(modifyState.disburse)}
            disabled={saving}
          >
            <Input
              placeholder="Principal, ICRC (e.g., ntohy-uex..., ...)"
              size="lg"
              bg={!isAccountOkay(modifyState.disburse) ? "bg.error" : ""}
              onChange={(e) =>
                setModifyState((prevState) => ({
                  ...prevState,
                  disburse: e.target.value,
                }))
              }
              value={modifyState.disburse}
            />
          </Field>
          <Heading letterSpacing="tight" size={"lg"} lineClamp={1} mt={3}>
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
        <Flex direction={"column"} gap={3} w="100%">
          <Heading letterSpacing="tight" size={"lg"} lineClamp={1}>
            <Highlight
              query={"Neuron"}
              styles={{
                px: "1",
                py: "1",
                color: "blue.fg",
              }}
            >
              Edit Neuron
            </Highlight>
          </Heading>
          <Separator />
          <Field label={"Followee"} disabled={saving}>
            <Input
              placeholder="Neuron ID (e.g., 6914974521667616512, ...)"
              size="lg"
              onChange={(e) =>
                setModifyState((prevState) => ({
                  ...prevState,
                  followee: e.target.value,
                }))
              }
              value={modifyState.followee}
            />
          </Field>
          <Field label={"Dissolve Delay (days)"} disabled={saving}>
            <Input
              placeholder="Days (e.g., 184, 2922, ...)"
              size="lg"
              onChange={(e) =>
                setModifyState((prevState) => ({
                  ...prevState,
                  delay: e.target.value,
                }))
              }
              value={modifyState.delay}
            />
          </Field>
          <RadioCard.Root
            defaultValue={varDissolve}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setModifyState((prevState) => ({
                ...prevState,
                status: event.target.value,
              }));
            }}
          >
            <RadioCard.Label>Neuron status</RadioCard.Label>
            <Flex align="center" gap={3}>
              <RadioCard.Item value="Locked">
                <RadioCard.ItemHiddenInput />
                <RadioCard.ItemControl>
                  <RadioCard.ItemContent>
                    <RadioCard.ItemText>Locked</RadioCard.ItemText>
                    <RadioCard.ItemDescription>
                      Staked and earning maturity
                    </RadioCard.ItemDescription>
                  </RadioCard.ItemContent>
                </RadioCard.ItemControl>
              </RadioCard.Item>

              <RadioCard.Item value="Dissolving">
                <RadioCard.ItemHiddenInput />
                <RadioCard.ItemControl>
                  <RadioCard.ItemContent>
                    <RadioCard.ItemText>Dissolving</RadioCard.ItemText>
                    <RadioCard.ItemDescription>
                      Unstaking, losing maturity
                    </RadioCard.ItemDescription>
                  </RadioCard.ItemContent>
                </RadioCard.ItemControl>
              </RadioCard.Item>
            </Flex>
          </RadioCard.Root>
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
                      bg={"bg"}
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

export default NeuronModify;
