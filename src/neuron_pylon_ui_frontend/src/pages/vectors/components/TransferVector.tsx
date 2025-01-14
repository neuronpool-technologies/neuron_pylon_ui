import React, { useState } from "react";
import {
  Button,
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
  Divider,
  FormControl,
  Icon,
} from "@chakra-ui/react";
import { WarningIcon, CheckCircleIcon } from "@chakra-ui/icons";
import {
  NodeShared,
  CommonModifyRequest,
  BatchCommandResponse,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { useTypedDispatch, useTypedSelector } from "@/hooks/hooks";
import { fetchWallet } from "@/state/ProfileSlice";
import {
  darkColorBox,
  darkGrayTextColor,
  lightColorBox,
  lightGrayTextColor,
} from "@/colors";
import { isAccountOkay, stringToIcrcAccount } from "@/tools/conversions";
import { InfoRow } from "@/components";
import { startNeuronPylonClient } from "@/client/Client";

type TransferVectorProps = {
  vector: NodeShared;
};

const TransferVector = ({ vector }: TransferVectorProps) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { principal } = useTypedSelector((state) => state.Profile);
  const dispatch = useTypedDispatch();

  // when transfer set refund as the new controller too automatically
  const [newOwner, setNewOwner] = useState<string>("");
  const [transferring, setTransferring] = useState<boolean>(false);
  const [transferred, setTransferred] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const transfer = async () => {
    try {
      setErrorMsg("");
      setTransferring(true);

      const pylon = await startNeuronPylonClient();

      const commonEditRequest: CommonModifyRequest = {
        active: [],
        controllers: [[stringToIcrcAccount(newOwner)]],
        extractors: [],
        destinations: [],
        sources: [],
        refund: [stringToIcrcAccount(newOwner)],
      };

      const response: BatchCommandResponse = await pylon.icrc55_command({
        expire_at: [],
        request_id: [],
        controller: stringToIcrcAccount(principal),
        signature: [],
        commands: [
          {
            modify_node: [Number(vector.id), [commonEditRequest], []],
          },
        ],
      });
      if (
        "ok" in response &&
        "modify_node" in response.ok.commands[0] &&
        "ok" in response.ok.commands[0].modify_node
      ) {
        setTransferring(false);
        setTransferred(true);
      } else {
        setTransferring(false);
        setTransferred(true);
        setErrorMsg(response.toString());
      }
    } catch (error) {
      setTransferring(false);
      setTransferred(false);
      setErrorMsg(error.toString());
    }
  };

  const closeModal = () => {
    setNewOwner("");
    setErrorMsg("");
    setTransferring(false);
    setTransferred(false);
    onClose();

    // update vectors on close
    dispatch(fetchWallet({ principal }));
  };

  return (
    <>
      <Button onClick={onOpen} w={"100%"} rounded="full" boxShadow="base">
        Transfer
      </Button>

      <Modal isOpen={isOpen} onClose={closeModal} isCentered>
        <ModalOverlay />
        <ModalContent bg={colorMode === "light" ? lightColorBox : darkColorBox}>
          <ModalHeader sx={{ textAlign: "center" }}>Transfer</ModalHeader>
          {!transferring ? <ModalCloseButton /> : null}
          <ModalBody>
            {!transferred ? (
              <FormControl>
                <Input
                  size="lg"
                  placeholder={"Principal, ICRC (e.g., ntohy-uex..., ...)"}
                  isDisabled={transferring}
                  isInvalid={newOwner !== "" && !isAccountOkay(newOwner)}
                  value={newOwner}
                  onChange={(event) => setNewOwner(event.target.value)}
                />
                <Flex direction="column" w="100%" gap={3} p={3}>
                  <InfoRow title={"Transfer cost"} stat={"0.0002 NTN"} />
                  <Divider />
                  <InfoRow title={"Charged to"} stat={"Billing account"} />
                </Flex>
                {errorMsg ? (
                  <Text mt={3} size="sm" color="red.500">
                    <WarningIcon /> {errorMsg}
                  </Text>
                ) : null}
              </FormControl>
            ) : null}
            {transferred && !errorMsg ? (
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
                  Vector #{vector.id} transferred!
                </Text>
              </Flex>
            ) : null}
          </ModalBody>

          <ModalFooter>
            <Button
              rounded="full"
              boxShadow="base"
              w="100%"
              onClick={transferred ? closeModal : transfer}
              isLoading={transferring}
              isDisabled={
                (newOwner !== "" && !isAccountOkay(newOwner)) || newOwner === ""
              }
            >
              {!transferred ? "Transfer now" : null}
              {transferred && !errorMsg ? "Transfer completed" : null}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TransferVector;
