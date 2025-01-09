import React, { useState } from "react";
import {
  Heading,
  VStack,
  Button,
  Flex,
  Box,
  Text,
  Image as ChakraImage,
  Badge,
  Spacer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  InputGroup,
  InputRightElement,
  Input,
  Icon,
  Center,
  useColorMode,
  useClipboard,
  Divider,
  IconButton,
} from "@chakra-ui/react";
import {
  CopyIcon,
  CheckIcon,
  CheckCircleIcon,
  WarningIcon,
  RepeatIcon,
} from "@chakra-ui/icons";
import NtnLogo from "../../../../assets/ntn-logo.png";
import { Principal } from "@dfinity/principal";
import { decodeIcrcAccount } from "@dfinity/ledger-icrc";
import {
  e8sToIcp,
  icpToE8s,
  isAccountOkay,
  isNtnAmountInvalid,
} from "@/tools/conversions";
import { fetchWallet } from "@/state/ProfileSlice";
import {
  darkColorBox,
  darkGrayColorBox,
  lightColorBox,
  lightGrayColorBox,
  lightGrayTokenBg,
} from "@/colors";
import { Auth } from "@/components";
import InfoRow from "@/components/InfoRow";
import { startNeuronPylonClient } from "@/client/Client";
import { useTypedDispatch, useTypedSelector } from "@/hooks/hooks";
import { BatchCommandRequest } from "@/declarations/neuron_pylon/neuron_pylon.did.js";

const NtnWallet = () => {
  const { logged_in, ntn_balance, principal } = useTypedSelector(
    (state) => state.Profile
  );

  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <>
      <Flex align="center" p={1} w="100%" mb={3}>
        <ChakraImage
          src={NtnLogo}
          alt="NTN logo"
          bg={colorMode === "light" ? lightGrayTokenBg : ""}
          borderRadius="full"
          h={45}
          mr={3}
          w={45}
        />
        <VStack align="start" spacing="1">
          <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>
            Neutrinite
          </Text>
          <Badge fontWeight="bold" fontSize={{ base: "xs", md: "sm" }}>
            NTN
          </Badge>
        </VStack>
        <Spacer />
        <Heading size={{ base: "sm", md: "md" }} noOfLines={1}>
          {logged_in ? e8sToIcp(Number(ntn_balance)).toFixed(2) : "0.00"}
        </Heading>
        <Refresh principal={principal} logged_in={logged_in} />
      </Flex>
      {logged_in ? (
        <Flex w="100%" gap={3}>
          <ReceiveNtn />
          <SendNtn />
        </Flex>
      ) : (
        <Auth />
      )}
    </>
  );
};

export default NtnWallet;

type RefreshProps = {
  principal: string;
  logged_in: boolean;
};

const Refresh = ({ principal, logged_in }: RefreshProps) => {
  const dispatch = useTypedDispatch();
  const [rotation, setRotation] = useState<number>(0);

  const refresh = () => {
    const newRotation = rotation + 360; // Increment by 360 degrees
    setRotation(newRotation);

    dispatch(fetchWallet({ principal }));
  };

  return (
    <IconButton
      ms={2}
      icon={
        <RepeatIcon
          transition={"transform 0.5s linear"}
          transform={`rotate(${rotation}deg)`}
        />
      }
      isDisabled={logged_in === false}
      size="xs"
      onClick={refresh}
      rounded="full"
      boxShadow="base"
      aria-label="Refresh wallet button"
    />
  );
};

const ReceiveNtn = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const ntnAddress = useTypedSelector((state) => state.Profile.ntn_address);
  const { colorMode, toggleColorMode } = useColorMode();
  const { hasCopied, onCopy } = useClipboard(ntnAddress.toLowerCase());

  return (
    <>
      <Button onClick={onOpen} w={"100%"} rounded="full" boxShadow="base">
        Receive
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg={colorMode === "light" ? lightColorBox : darkColorBox}>
          <ModalHeader sx={{ textAlign: "center" }}>Receive</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <Box
                bg={
                  colorMode === "light" ? lightGrayColorBox : darkGrayColorBox
                }
                borderRadius="md"
                p={3}
              >
                <Text noOfLines={3}>{ntnAddress.toLowerCase()}</Text>
                <Flex mt={3}>
                  <Spacer />
                  <IconButton
                    aria-label="Copy address"
                    rounded="full"
                    boxShadow="base"
                    icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                    size="sm"
                    onClick={onCopy}
                  />
                </Flex>
              </Box>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button w="100%" onClick={onClose} rounded="full" boxShadow="base">
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const SendNtn = () => {
  const { ntn_balance, principal, ntn_ledger } = useTypedSelector(
    (state) => state.Profile
  );
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useTypedDispatch();

  const [address, setAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const [sending, setSending] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const Transfer = async () => {
    const amountConverted = icpToE8s(Number(amount));
    const ntn_fee = 10000n;

    setErrorMsg("");

    if (amountConverted > ntn_fee) {
      setSending(true);

      const pylon = await startNeuronPylonClient();

      try {
        const transferArgs: BatchCommandRequest = {
          expire_at: [],
          request_id: [],
          controller: { owner: Principal.fromText(principal), subaccount: [] },
          signature: [],
          commands: [
            {
              transfer: {
                ledger: { ic: Principal.fromText(ntn_ledger) },
                from: {
                  account: {
                    owner: Principal.fromText(principal),
                    subaccount: [],
                  },
                },
                to: {
                  external_account: {
                    ic: {
                      owner: decodeIcrcAccount(address).owner,
                      subaccount: decodeIcrcAccount(address).subaccount
                        ? [decodeIcrcAccount(address).subaccount]
                        : [],
                    },
                  },
                },
                amount: amountConverted,
              },
            },
          ],
        };

        await pylon.icrc55_command(transferArgs);

        setSending(false);
        setSent(true);
      } catch (error) {
        setSending(false);
        setErrorMsg(error.toString());
      }
    }
  };

  const closeModal = () => {
    setAddress("");
    setAmount("");
    setErrorMsg("");
    setSending(false);
    setSent(false);
    onClose();

    // update balances on close
    dispatch(fetchWallet({ principal }));
  };

  return (
    <>
      <Button onClick={onOpen} w={"100%"} rounded="full" boxShadow="base">
        Send
      </Button>
      <Modal isOpen={isOpen} onClose={closeModal} isCentered>
        <ModalOverlay />
        <ModalContent bg={colorMode === "light" ? lightColorBox : darkColorBox}>
          <ModalHeader sx={{ textAlign: "center" }}>Send</ModalHeader>
          {!sending ? <ModalCloseButton /> : null}
          <ModalBody>
            {!sent ? (
              <FormControl>
                <Input
                  size="lg"
                  mb={3}
                  placeholder="Destination address"
                  isDisabled={sending}
                  isInvalid={address !== "" && !isAccountOkay(address)}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
                <InputGroup>
                  <Input
                    size="lg"
                    placeholder="Amount"
                    value={amount}
                    isDisabled={sending}
                    isInvalid={isNtnAmountInvalid(ntn_balance, amount)}
                    type="number"
                    onChange={(event) => setAmount(event.target.value)}
                  />
                  <InputRightElement width="4.5rem" h="100%">
                    <Button
                      rounded="full"
                      boxShadow="base"
                      _hover={{ opacity: "0.8" }}
                      h="1.75rem"
                      size="sm"
                      isDisabled={sending}
                      onClick={() => {
                        const newAmount = e8sToIcp(Number(ntn_balance));
                        setAmount(newAmount.toString() || "");
                      }}
                    >
                      Max
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <VStack align="start" p={3} gap={3}>
                  <InfoRow
                    title={"Wallet balance"}
                    stat={`${e8sToIcp(Number(ntn_balance))} NTN`}
                  />
                  <Divider />
                  <InfoRow title={"Network fee"} stat={"0.0001 NTN"} />
                </VStack>
                {errorMsg ? (
                  <Text mt={3} size="sm" color="red.500">
                    <WarningIcon /> {errorMsg}
                  </Text>
                ) : null}
              </FormControl>
            ) : null}
            {sent && !errorMsg ? (
              <Center>
                <Icon as={CheckCircleIcon} boxSize={100} />
              </Center>
            ) : null}
          </ModalBody>

          <ModalFooter>
            <Button
              rounded="full"
              boxShadow="base"
              w="100%"
              onClick={sent ? closeModal : Transfer}
              isLoading={sending}
              isDisabled={
                icpToE8s(Number(amount)) <= 10000 ||
                (!sent && icpToE8s(Number(amount)) > Number(ntn_balance)) ||
                (address !== "" && !isAccountOkay(address)) ||
                address === ""
              }
            >
              {!sent ? "Send now" : null}
              {sent && !errorMsg ? "Transaction completed" : null}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
