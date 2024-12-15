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
import { useSelector, useDispatch } from "react-redux";
import { Principal } from "@dfinity/principal";
import { decodeIcrcAccount } from "@dfinity/ledger-icrc";
import { e8sToIcp, icpToE8s } from "../../../tools/conversions";
import { fetchWallet } from "../../../state/ProfileSlice";
import {
  darkBorderColor,
  darkColorBox,
  darkGrayColorBox,
  lightBorderColor,
  lightColorBox,
  lightGrayColorBox,
} from "../../../colors";
import { Auth } from "../../../components";
import { showToast } from "../../../tools/toast";
import InfoRow from "../../../components/InfoRow";
import { startNeuronPylonClient } from "../../../client/Client";

const NtnWallet = () => {
  const { logged_in, ntn_balance, principal } = useSelector(
    (state) => state.Profile
  );

  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <>
      <Flex align="center" p={1} w="100%" mb={3}>
        <ChakraImage
          src={NtnLogo}
          alt="NTN logo"
          bg={colorMode === "light" ? "#edf2f6" : ""}
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
          {logged_in ? Number(e8sToIcp(ntn_balance)).toFixed(4) : "0.0000"}
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

const Refresh = ({ principal, logged_in }) => {
  const dispatch = useDispatch();
  const [rotation, setRotation] = useState(0);

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
  const ntnAddress = useSelector((state) => state.Profile.ntn_address);
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
          <ModalHeader align="center">Receive</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <Box
                bg={
                  colorMode === "light" ? lightGrayColorBox : darkGrayColorBox
                }
                border={
                  colorMode === "light"
                    ? `solid ${lightBorderColor} 1px`
                    : `solid ${darkBorderColor} 1px`
                }
                borderRadius="md"
                p={3}
              >
                <Text noOfLines={3}>{ntnAddress.toLowerCase()}</Text>
                <Flex mt={3}>
                  <Spacer />
                  <Button
                    rounded="full"
                    boxShadow="base"
                    rightIcon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                    size="sm"
                    onClick={onCopy}
                  >
                    {hasCopied ? "Copied" : "Copy"}
                  </Button>
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
  const { ntn_balance, principal, ntn_ledger } = useSelector(
    (state) => state.Profile
  );
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useDispatch();

  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);

  const Transfer = async () => {
    const amountConverted = icpToE8s(amount);
    const ntn_fee = 10000n;

    if (amountConverted > ntn_fee) {
      setSending(true);

      const pylon = await startNeuronPylonClient();

      try {
        await pylon.icrc55_command({
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
        });

        setSending(false);
        setSent(true);
      } catch (error) {
        setSending(false);
        setSent(true);
        setFailed(true);

        console.error(error);

        showToast({
          title: "Error sending NTN",
          description: error.toString(),
          status: "warning",
        });
      }
    }
  };

  const closeModal = () => {
    setAddress("");
    setAmount("");
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
          <ModalHeader align="center">Send</ModalHeader>
          {!sending ? <ModalCloseButton /> : null}
          <ModalBody>
            {!sent ? (
              <FormControl>
                <Input
                  size="lg"
                  mb={3}
                  placeholder="Destination address"
                  isDisabled={sending}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
                <InputGroup>
                  <Input
                    size="lg"
                    placeholder="Amount"
                    value={amount}
                    isDisabled={sending}
                    isInvalid={
                      (amount !== "" && icpToE8s(Number(amount)) <= 10000) ||
                      icpToE8s(Number(amount)) > Number(ntn_balance)
                    }
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
                        setAmount(newAmount || "");
                      }}
                    >
                      Max
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <VStack align="start" p={3} gap={3}>
                  <InfoRow
                    title={"Wallet balance"}
                    stat={`${e8sToIcp(ntn_balance)} NTN`}
                  />
                  <Divider />
                  <InfoRow title={"Network fee"} stat={"0.0001 NTN"} />
                </VStack>
              </FormControl>
            ) : null}
            {sent && !failed ? (
              <Center>
                <Icon as={CheckCircleIcon} boxSize={100} />
              </Center>
            ) : null}
            {sent && failed ? (
              <Center>
                <Icon as={WarningIcon} boxSize={100} />
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
                (!sent && icpToE8s(Number(amount)) > Number(ntn_balance))
              }
            >
              {!sent ? "Send now" : null}
              {sent && !failed ? "Transaction completed" : null}
              {sent && failed ? "Transaction failed" : null}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
