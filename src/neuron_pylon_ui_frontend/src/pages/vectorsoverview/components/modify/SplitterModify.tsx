import { useEffect, useState, useMemo } from "react";
import {
  Flex,
  Input,
  Separator,
  Spacer,
  Heading,
  Highlight,
  Button,
  IconButton,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { BiPlus, BiMinus, BiSave } from "react-icons/bi";
import {
  accountToString,
  isAccountOkay,
  stringToIcrcAccount,
} from "@/utils/AccountTools";
import {
  NodeShared,
  PylonMetaResp,
  ModifyRequest,
  InputAddress,
} from "@/declarations/neuron_pylon/neuron_pylon.did";
import { extractNodeType } from "@/utils/Node";
import { useActors } from "@/hooks/useActors";
import { modify } from "@/client/commands";
import { useTypedSelector } from "@/hooks/useRedux";
import { CommonModifyRequest } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { ConfirmDialog, StatBox, StatRow } from "@/components";
import { e8sToIcp } from "@/utils/TokenTools";
import { toaster } from "@/components/ui/toaster";
import { InputGroup } from "@/components/ui/input-group";

const SplitterModify = ({
  vector,
  meta,
}: {
  vector: NodeShared;
  meta: PylonMetaResp;
}) => {
  const { principal } = useTypedSelector((state) => state.Wallet);
  const { destinations, controller: originalController } = extractNodeType(
    vector,
    meta
  );

  const [saving, setSaving] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { actors } = useActors();

  const originalRefundAccount = accountToString(vector.refund);

  // State for tracking modifications
  const [modifyState, setModifyState] = useState({
    destinations: [...destinations],
    controller: originalController,
    refundAccount: originalRefundAccount,
  });

  // Add a new destination with default values
  const addDestination = () => {
    if (modifyState.destinations.length >= 6) {
      toaster.error({
        title: "Maximum destinations reached",
        description: "You cannot add more than 6 destinations",
      });
      return;
    }

    setModifyState((prevState) => ({
      ...prevState,
      destinations: [...prevState.destinations, ["0", ""]],
    }));
  };

  // Remove a destination at specific index
  const removeDestination = (indexToRemove: number) => {
    if (modifyState.destinations.length <= 1) {
      toaster.error({
        title: "Cannot remove all destinations",
        description: "At least one destination must remain",
      });
      return;
    }

    setModifyState((prevState) => ({
      ...prevState,
      destinations: prevState.destinations.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  };

  // Update destination address
  const updateDestinationAddress = (index: number, value: string) => {
    const newDestinations = [...modifyState.destinations];
    newDestinations[index] = [newDestinations[index][0], value];
    setModifyState((prevState) => ({
      ...prevState,
      destinations: newDestinations,
    }));
  };

  // Update destination weight
  const updateDestinationWeight = (index: number, value: string) => {
    const newDestinations = [...modifyState.destinations];
    newDestinations[index] = [value, newDestinations[index][1]];
    setModifyState((prevState) => ({
      ...prevState,
      destinations: newDestinations,
    }));
  };

  // Calculate what has changed compared to original values
  const diffChanges = useMemo(() => {
    const changes: {
      [key: string]: { from: any; to: any; modifiedCount?: number };
    } = {};

    // Check if controller changed
    if (modifyState.controller !== originalController) {
      changes["controller"] = {
        from: originalController,
        to: modifyState.controller,
      };
    }

    // Check if refund account changed
    if (modifyState.refundAccount !== originalRefundAccount) {
      changes["refundAccount"] = {
        from: originalRefundAccount,
        to: modifyState.refundAccount,
      };
    }

    // Check if destinations changed
    if (
      JSON.stringify(modifyState.destinations) !== JSON.stringify(destinations)
    ) {
      // Calculate how many destinations were actually modified
      const modifiedCount = modifyState.destinations.reduce(
        (count, dest, index) => {
          // Check if this destination is different from original or if it's a new one
          const isModified =
            index >= destinations.length ||
            dest[0] !== destinations[index][0] ||
            dest[1] !== destinations[index][1];
          return isModified ? count + 1 : count;
        },
        0
      );

      changes["destinations"] = {
        from: destinations,
        to: modifyState.destinations,
        modifiedCount: modifiedCount,
      };
    }

    return changes;
  }, [modifyState, originalController, originalRefundAccount, destinations]);

  // Update hasUnsavedChanges when diffChanges changes
  useEffect(() => {
    setHasUnsavedChanges(Object.keys(diffChanges).length > 0);
  }, [diffChanges]);

  // Save changes to the vector
  const saveChanges = async () => {
    setSaving(true);

    try {
      // Convert destinations to the format expected by the API
      const formattedDestinations: Array<[InputAddress]> =
        modifyState.destinations.map((dest) => {
          return [{ ic: stringToIcrcAccount(dest[1]) }];
        });

      // Prepare the common modify request
      const commonEditRequest: CommonModifyRequest = {
        active: [],
        controllers: [[stringToIcrcAccount(modifyState.controller)]],
        extractors: [],
        destinations: [formattedDestinations],
        sources: [],
        refund: [stringToIcrcAccount(modifyState.refundAccount)],
      };

      // Prepare the specific modify request for splitter
      const editRequest: ModifyRequest = {
        devefi_split: {
          split: modifyState.destinations.map((dest) => BigInt(dest[0])),
        },
      };

      // Submit the modification request
      await modify({
        pylon: actors.neuronPylon,
        controller: principal,
        modReq: [vector.id, [commonEditRequest], [editRequest]],
      });

      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to modify vector:", error);
      throw error;
    }
  };

  // Confirm and execute the save operation
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
          {modifyState.destinations.map((d, index) => (
            <Flex align="end" gap={3} key={index}>
              <Field
                flex="2"
                label={`Destination ${index + 1}`}
                invalid={!isAccountOkay(d[1]) && d[1].length > 0}
              >
                <Input
                  placeholder="Principal, ICRC (e.g., ntohy-uex..., ...)"
                  size="lg"
                  bg={!isAccountOkay(d[1]) && d[1].length > 0 ? "bg.error" : ""}
                  onChange={(e) =>
                    updateDestinationAddress(index, e.target.value)
                  }
                  value={d[1]}
                  disabled={saving}
                />
              </Field>
              <Field flex="1">
                <InputGroup startElement="%">
                  <Input
                    placeholder="Split weight"
                    size="lg"
                    type="number"
                    min="0"
                    onChange={(e) =>
                      updateDestinationWeight(index, e.target.value)
                    }
                    value={d[0]}
                    disabled={saving}
                  />
                </InputGroup>
              </Field>
              <IconButton
                onClick={() => removeDestination(index)}
                aria-label="Remove destination"
                disabled={saving}
                variant="surface"
                rounded="md"
                size="lg"
                boxShadow="xs"
                colorPalette={"red"}
              >
                <BiMinus />
              </IconButton>
            </Flex>
          ))}
          <Button
            w="100%"
            variant="surface"
            rounded="md"
            boxShadow="xs"
            colorPalette={"green"}
            onClick={addDestination}
            disabled={saving}
          >
            <BiPlus /> Add Destination
          </Button>
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
            invalid={
              !isAccountOkay(modifyState.controller) &&
              modifyState.controller.length > 0
            }
          >
            <Input
              placeholder="Principal, ICRC (e.g., ntohy-uex..., ...)"
              size="lg"
              bg={
                !isAccountOkay(modifyState.controller) &&
                modifyState.controller.length > 0
                  ? "bg.error"
                  : ""
              }
              onChange={(e) =>
                setModifyState((prevState) => ({
                  ...prevState,
                  controller: e.target.value,
                }))
              }
              value={modifyState.controller}
              disabled={saving}
            />
          </Field>
          <Field
            label={"Refund account"}
            invalid={
              !isAccountOkay(modifyState.refundAccount) &&
              modifyState.refundAccount.length > 0
            }
          >
            <Input
              placeholder="Principal, ICRC (e.g., ntohy-uex..., ...)"
              size="lg"
              bg={
                !isAccountOkay(modifyState.refundAccount) &&
                modifyState.refundAccount.length > 0
                  ? "bg.error"
                  : ""
              }
              onChange={(e) =>
                setModifyState((prevState) => ({
                  ...prevState,
                  refundAccount: e.target.value,
                }))
              }
              value={modifyState.refundAccount}
              disabled={saving}
            />
          </Field>
        </Flex>
      </Flex>

      {/* Save Button and Confirmation Dialog */}
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
                  {diffChanges.controller && (
                    <StatBox
                      title="Controller"
                      bg={"bg"}
                      fontSize="md"
                      value={diffChanges.controller.to}
                    />
                  )}
                  {diffChanges.refundAccount && (
                    <StatBox
                      title="Refund Account"
                      bg={"bg"}
                      fontSize="md"
                      value={diffChanges.refundAccount.to}
                    />
                  )}
                  {diffChanges.destinations && (
                    <StatBox
                      title="Destinations"
                      bg={"bg"}
                      fontSize="md"
                      value={`Modified (${diffChanges.destinations.modifiedCount} of ${modifyState.destinations.length} destinations)`}
                    />
                  )}
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

export default SplitterModify;
