import React, { useState } from "react";
import {
  Button,
  InputGroup,
  InputLeftElement,
  Input,
  Flex,
  Text,
  Image as ChakraImage,
  useColorMode,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  VStack,
  Select,
  Divider,
  Icon,
} from "@chakra-ui/react";
import IcLogo from "../../../../assets/ic-logo.png";
import {
  LockIcon,
  WarningIcon,
  StarIcon,
  CheckCircleIcon,
} from "@chakra-ui/icons";
import {
  NodeShared,
  CommonModifyRequest,
  ModifyRequest,
  BatchCommandResponse,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import {
  darkColorBox,
  darkGrayTextColor,
  lightColorBox,
  lightGrayTextColor,
} from "@/colors";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { HintPopover, InfoRow } from "@/components";
import {
  isAccountOkay,
  isDelayOkay,
  stringToIcrcAccount,
} from "@/tools/conversions";
import { startNeuronPylonClient } from "@/client/Client";
import { useTypedDispatch, useTypedSelector } from "@/hooks/hooks";
import { fetchWallet } from "@/state/ProfileSlice";

export type EditState = {
  maturityDestination: string;
  disburseDestination: string;
  dissolveDelay: string;
  followee: string;
  startDissolving: string;
};

type EditVectorProps = {
  vector: NodeShared;
};

const EditVector = ({ vector }: EditVectorProps) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { principal } = useTypedSelector((state) => state.Profile);
  const dispatch = useTypedDispatch();

  const initialEditState: EditState = {
    maturityDestination:
      "ic" in vector.destinations[0].endpoint
        ? vector.destinations[0].endpoint.ic.account[0]
          ? encodeIcrcAccount({
              owner: Principal.fromText(
                vector.destinations[0].endpoint.ic.account[0].owner.toString()
              ),
              subaccount:
                vector.destinations[0].endpoint.ic.account[0].subaccount[0],
            })
          : ""
        : null,
    disburseDestination:
      "ic" in vector.destinations[1].endpoint
        ? vector.destinations[1].endpoint.ic.account[0]
          ? encodeIcrcAccount({
              owner: Principal.fromText(
                vector.destinations[1].endpoint.ic.account[0].owner.toString()
              ),
              subaccount:
                vector.destinations[1].endpoint.ic.account[0].subaccount[0],
            })
          : ""
        : null,
    dissolveDelay:
      "DelayDays" in
      vector.custom[0].devefi_jes1_icpneuron.variables.dissolve_delay
        ? vector.custom[0].devefi_jes1_icpneuron.variables.dissolve_delay
            .DelayDays > 2922
          ? "2922"
          : vector.custom[0].devefi_jes1_icpneuron.variables.dissolve_delay.DelayDays.toString()
        : "184",
    followee:
      "FolloweeId" in vector.custom[0].devefi_jes1_icpneuron.variables.followee
        ? vector.custom[0].devefi_jes1_icpneuron.variables.followee.FolloweeId.toString()
        : "6914974521667616512",
    startDissolving:
      "Locked" in
      vector.custom[0].devefi_jes1_icpneuron.variables.dissolve_status
        ? "Locked"
        : "Dissolving",
  };

  const [editState, setEditState] = useState<EditState>(initialEditState);
  const [editing, setEditing] = useState<boolean>(false);
  const [edited, setEdited] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const edit = async () => {
    try {
      setErrorMsg("");
      setEditing(true);

      const pylon = await startNeuronPylonClient();

      const commonEditRequest: CommonModifyRequest = {
        active: [],
        controllers: [],
        extractors: [],
        destinations: [
          [
            [{ ic: stringToIcrcAccount(editState.maturityDestination) }],
            [{ ic: stringToIcrcAccount(editState.disburseDestination) }],
          ],
        ],
        sources: [],
        refund: [],
      };

      const editRequest: ModifyRequest = {
        devefi_jes1_icpneuron: {
          dissolve_delay: [{ DelayDays: BigInt(editState.dissolveDelay) }],
          dissolve_status:
            editState.startDissolving === "Dissolving"
              ? [{ Dissolving: null }]
              : [{ Locked: null }],
          followee: [{ FolloweeId: BigInt(editState.followee) }],
        },
      };

      const response: BatchCommandResponse = await pylon.icrc55_command({
        expire_at: [],
        request_id: [],
        controller: stringToIcrcAccount(principal),
        signature: [],
        commands: [
          {
            modify_node: [
              Number(vector.id),
              [commonEditRequest],
              [editRequest],
            ],
          },
        ],
      });

      if (
        "ok" in response &&
        "modify_node" in response.ok.commands[0] &&
        "ok" in response.ok.commands[0].modify_node
      ) {
        dispatch(fetchWallet({ principal }));
        setEditing(false);
        setEdited(true);
      } else {
        setEditing(false);
        setEdited(true);
        setErrorMsg(response.toString());
      }
    } catch (error) {
      setEditing(false);
      setEdited(false);
      setErrorMsg(error.toString());
    }
  };

  const closeModal = () => {
    setEditing(false);
    setEdited(false);
    setErrorMsg("");
    setEditState(initialEditState);
    onClose();
  };

  return (
    <>
      <Button onClick={onOpen} rounded="full" boxShadow="base" w="100%">
        Edit
      </Button>

      <Modal isOpen={isOpen} onClose={closeModal} isCentered>
        <ModalOverlay />
        <ModalContent bg={colorMode === "light" ? lightColorBox : darkColorBox}>
          <ModalHeader sx={{ textAlign: "center" }}>Edit</ModalHeader>
          {!editing ? <ModalCloseButton /> : null}
          <ModalBody>
            {!edited ? (
              <VStack align="start" gap={3}>
                <Flex align="center" gap={1}>
                  <Text
                    fontSize={"sm"}
                    color={
                      colorMode === "light"
                        ? lightGrayTextColor
                        : darkGrayTextColor
                    }
                    fontWeight={500}
                    noOfLines={1}
                  >
                    Maturity destination
                  </Text>
                  <HintPopover details="This principal or ICRC account will receive the neuron’s maturity." />
                </Flex>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" h="100%">
                    <ChakraImage
                      src={IcLogo}
                      alt="Internet identity logo"
                      h={"20px"}
                      w={"auto"}
                    />
                  </InputLeftElement>
                  <Input
                    pl={10}
                    placeholder={"Principal, ICRC (e.g., ntohy-uex..., ...)"}
                    size="lg"
                    value={editState.maturityDestination}
                    isInvalid={
                      editState.maturityDestination !== "" &&
                      !isAccountOkay(editState.maturityDestination)
                    }
                    isDisabled={editing}
                    type="text"
                    onChange={(event) =>
                      setEditState((prevState) => ({
                        ...prevState,
                        maturityDestination: event.target.value,
                      }))
                    }
                  />
                </InputGroup>
                <Flex align="center" gap={1}>
                  <Text
                    fontSize={"sm"}
                    color={
                      colorMode === "light"
                        ? lightGrayTextColor
                        : darkGrayTextColor
                    }
                    fontWeight={500}
                    noOfLines={1}
                  >
                    Disburse destination
                  </Text>
                  <HintPopover details="If you dissolve your neuron, any disbursed ICP will be sent to this principal or ICRC account." />
                </Flex>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" h="100%">
                    <ChakraImage
                      src={IcLogo}
                      alt="Internet identity logo"
                      h={"20px"}
                      w={"auto"}
                    />
                  </InputLeftElement>
                  <Input
                    pl={10}
                    placeholder={"Principal, ICRC (e.g., ntohy-uex..., ..)"}
                    size="lg"
                    value={editState.disburseDestination}
                    isInvalid={
                      editState.disburseDestination !== "" &&
                      !isAccountOkay(editState.disburseDestination)
                    }
                    isDisabled={editing}
                    type="text"
                    onChange={(event) =>
                      setEditState((prevState) => ({
                        ...prevState,
                        disburseDestination: event.target.value,
                      }))
                    }
                  />
                </InputGroup>
                <Flex align="center" gap={1}>
                  <Text
                    fontSize={"sm"}
                    color={
                      colorMode === "light"
                        ? lightGrayTextColor
                        : darkGrayTextColor
                    }
                    fontWeight={500}
                    noOfLines={1}
                  >
                    Dissolve delay
                  </Text>
                  <HintPopover details="The dissolve delay can only be increased by a minimum of one week and cannot be decreased." />
                </Flex>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" h="100%">
                    <LockIcon />
                  </InputLeftElement>
                  <Input
                    pl={10}
                    placeholder={"Days (e.g., 184, 2922, ...)"}
                    size="lg"
                    isDisabled={editing}
                    value={editState.dissolveDelay}
                    isInvalid={!isDelayOkay(Number(editState.dissolveDelay))}
                    onChange={(event) =>
                      setEditState((prevState) => ({
                        ...prevState,
                        dissolveDelay: event.target.value,
                      }))
                    }
                  />
                </InputGroup>
                <Text
                  fontSize={"sm"}
                  color={
                    colorMode === "light"
                      ? lightGrayTextColor
                      : darkGrayTextColor
                  }
                  fontWeight={500}
                  noOfLines={1}
                >
                  Followee
                </Text>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" h="100%">
                    <StarIcon />
                  </InputLeftElement>
                  <Input
                    pl={10}
                    placeholder={"Neuron ID (e.g., 6914974521667616512, ...)"}
                    size="lg"
                    value={editState.followee}
                    isDisabled={editing}
                    isInvalid={editState.followee === ""}
                    onChange={(event) =>
                      setEditState((prevState) => ({
                        ...prevState,
                        followee: event.target.value,
                      }))
                    }
                  />
                </InputGroup>
                <Text
                  fontSize={"sm"}
                  color={
                    colorMode === "light"
                      ? lightGrayTextColor
                      : darkGrayTextColor
                  }
                  fontWeight={500}
                  noOfLines={1}
                >
                  Neuron status
                </Text>
                <Select
                  variant="outline"
                  size={"lg"}
                  isDisabled={editing}
                  value={editState.startDissolving}
                  onChange={(event) =>
                    setEditState((prevState) => ({
                      ...prevState,
                      startDissolving: event.target.value,
                    }))
                  }
                >
                  <option value={"Locked"}>Locked</option>
                  <option value={"Dissolving"}>Dissolving</option>
                </Select>
                <Flex direction="column" w="100%" gap={3} p={3}>
                  <InfoRow title={"Edit cost"} stat={"0.0002 NTN"} />
                  <Divider />
                  <InfoRow title={"Charged to"} stat={"Billing account"} />
                </Flex>
                {errorMsg ? (
                  <Text size="sm" color="red.500">
                    <WarningIcon /> {errorMsg}
                  </Text>
                ) : null}
              </VStack>
            ) : null}
            {edited && !errorMsg ? (
              <Flex direction={"column"} gap={3} w={"100%"} align="center">
                <Icon as={CheckCircleIcon} boxSize={100} />
                <Text
                  fontSize={"sm"}
                  color={
                    colorMode === "light"
                      ? lightGrayTextColor
                      : darkGrayTextColor
                  }
                  fontWeight={500}
                  noOfLines={1}
                >
                  Vector #{vector.id} edited!
                </Text>
              </Flex>
            ) : null}
          </ModalBody>

          <ModalFooter>
            <Flex align="center" w="100%" gap={3}>
              <Button
                rounded="full"
                boxShadow="base"
                variant="outline"
                w="100%"
                isDisabled={editing}
                onClick={closeModal}
              >
                Cancel
              </Button>
              <Button
                rounded="full"
                boxShadow="base"
                w="100%"
                isLoading={editing}
                onClick={edited ? closeModal : edit}
                isDisabled={
                  editState.disburseDestination === "" ||
                  (editState.disburseDestination !== "" &&
                    !isAccountOkay(editState.disburseDestination)) ||
                  editState.maturityDestination === "" ||
                  (editState.maturityDestination !== "" &&
                    !isAccountOkay(editState.maturityDestination)) ||
                  !isDelayOkay(Number(editState.dissolveDelay)) ||
                  editState.followee === ""
                }
              >
                {!edited ? "Save changes" : null}
                {edited && !errorMsg ? "Vector edited" : null}
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditVector;
