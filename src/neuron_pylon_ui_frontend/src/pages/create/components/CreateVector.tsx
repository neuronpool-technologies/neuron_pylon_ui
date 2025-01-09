import React, { useReducer } from "react";
import {
  Button,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Input,
  Select,
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
  Box,
  VStack,
  Divider,
  Center,
  Icon,
} from "@chakra-ui/react";
import { LockIcon, WarningIcon, CheckCircleIcon } from "@chakra-ui/icons";
import Fireworks from "react-canvas-confetti/dist/presets/fireworks";
import IcLogo from "../../../../assets/ic-logo.png";
import NtnLogo from "../../../../assets/ntn-logo.png";
import { Auth, InfoRow, LabelBox } from "@/components";
import { useTypedSelector } from "@/hooks/hooks";
import {
  daysToMonthsAndYears,
  e8sFeeToPercentage,
  e8sToIcp,
  icpToE8s,
  isAccountOkay,
  isDelayOkay,
  isNtnAmountInvalid,
} from "@/tools/conversions";
import {
  darkBorderColor,
  darkColorBox,
  darkGrayTextColor,
  lightBorderColor,
  lightColorBox,
  lightGrayTextColor,
} from "@/colors";
import { initialCreateState, createReducer } from "./CreateReducer";

const CreateVector = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { logged_in, ntn_balance } = useTypedSelector((state) => state.Profile);
  const { billing } = useTypedSelector((state) => state.Meta);

  const createCost =
    billing && "min_create_balance" in billing
      ? e8sToIcp(Number(billing.min_create_balance))
      : 0;

  const [createState, createDispatch] = useReducer(
    createReducer,
    initialCreateState
  );

  // when create +theIntitialCreateBalance always
  // when create if followee default do default otherwise input custom
  // can just always use dissolve delay

  const closeModal = () => {
    createDispatch({ type: "RESET" });
    onClose();
  };

  return (
    <>
      <Flex direction="column" gap={3} w="100%">
        <Text
          fontSize={"sm"}
          color={colorMode === "light" ? lightGrayTextColor : darkGrayTextColor}
          fontWeight={500}
          noOfLines={1}
        >
          Maturity destination
        </Text>
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
            placeholder={"Principal, ICRC-1 (e.g., ntohy-uex..., ...)"}
            size="lg"
            value={createState.maturityDestination}
            isInvalid={
              createState.maturityDestination !== "" &&
              !isAccountOkay(createState.maturityDestination)
            }
            isDisabled={createState.isCreating}
            type="text"
            onChange={(event) =>
              createDispatch({
                type: "SET_MATURITY_DESTINATION",
                payload: event.target.value,
              })
            }
          />
        </InputGroup>
        <Text
          fontSize={"sm"}
          color={colorMode === "light" ? lightGrayTextColor : darkGrayTextColor}
          fontWeight={500}
          noOfLines={1}
        >
          Disburse destination
        </Text>
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
            placeholder={"Principal, ICRC-1 (e.g., ntohy-uex..., ..)"}
            size="lg"
            value={createState.disburseDestination}
            isInvalid={
              createState.disburseDestination !== "" &&
              !isAccountOkay(createState.disburseDestination)
            }
            isDisabled={createState.isCreating}
            type="text"
            onChange={(event) =>
              createDispatch({
                type: "SET_DISBURSE_DESTINATION",
                payload: event.target.value,
              })
            }
          />
        </InputGroup>
        <Text
          fontSize={"sm"}
          color={colorMode === "light" ? lightGrayTextColor : darkGrayTextColor}
          fontWeight={500}
          noOfLines={1}
        >
          Dissolve delay
        </Text>
        <Select
          variant="outline"
          size={"lg"}
          isDisabled={createState.isCreating}
          onChange={(event) => {
            switch (event.target.value) {
              case "6months":
                createDispatch({ type: "SET_DISSOLVE_DELAY", payload: 184 });
                createDispatch({ type: "SET_CUSTOM_DELAY", payload: false });
                break;
              case "8years":
                createDispatch({ type: "SET_DISSOLVE_DELAY", payload: 3000 });
                createDispatch({ type: "SET_CUSTOM_DELAY", payload: false });
                break;
              default:
                createDispatch({ type: "SET_CUSTOM_DELAY", payload: true });
            }
          }}
        >
          <option value={"6months"}>6 months</option>
          <option value={"8years"}>8 years</option>
          <option value={"custom"}>Custom</option>
        </Select>
        {createState.customDelay ? (
          <InputGroup>
            <InputLeftElement pointerEvents="none" h="100%">
              <LockIcon />
            </InputLeftElement>
            <Input
              pl={10}
              placeholder={"Days (e.g., 184, 2922, ...)"}
              size="lg"
              type="number"
              isDisabled={createState.isCreating}
              isInvalid={!isDelayOkay(createState.dissolveDelay)}
              onChange={(event) =>
                createDispatch({
                  type: "SET_DISSOLVE_DELAY",
                  payload: Number(event.target.value),
                })
              }
            />
          </InputGroup>
        ) : null}

        <Text
          fontSize={"sm"}
          color={colorMode === "light" ? lightGrayTextColor : darkGrayTextColor}
          fontWeight={500}
          noOfLines={1}
        >
          Followee
        </Text>
        <Select
          variant="outline"
          size={"lg"}
          isDisabled={createState.isCreating}
          onChange={(event) => {
            switch (event.target.value) {
              case "default":
                createDispatch({ type: "SET_FOLLOWEE", payload: "Default" });
                createDispatch({ type: "SET_CUSTOM_FOLLOWEE", payload: false });
                break;
              default:
                createDispatch({ type: "SET_CUSTOM_FOLLOWEE", payload: true });
            }
          }}
        >
          <option value={"default"}>Rakeoff.io</option>
          <option value={"custom"}>Custom</option>
        </Select>
        {createState.customFollowee ? (
          <InputGroup>
            <InputLeftElement pointerEvents="none" h="100%">
              <LockIcon />
            </InputLeftElement>
            <Input
              pl={10}
              placeholder={"Neuron ID (e.g., 6914974521667616512, ...)"}
              size="lg"
              type="number"
              isDisabled={createState.isCreating}
              isInvalid={createState.followee === ""}
              onChange={(event) =>
                createDispatch({
                  type: "SET_FOLLOWEE",
                  payload: event.target.value,
                })
              }
            />
          </InputGroup>
        ) : null}
        <Text
          fontSize={"sm"}
          color={colorMode === "light" ? lightGrayTextColor : darkGrayTextColor}
          fontWeight={500}
          noOfLines={1}
        >
          Billing option
        </Text>
        <Select
          variant="outline"
          size={"lg"}
          isDisabled={createState.isCreating}
          onChange={(event) => {
            createDispatch({
              type: "SET_BILLING_OPTION",
              payload: Number(event.target.value),
            });

            if (!Number(event.target.value)) {
              createDispatch({
                type: "SET_INITIAL_CREATE_BALANCE",
                payload: "",
              });
            }
          }}
        >
          <option value={0}>5% of Maturity</option>
          <option value={1}>3.17 NTN per day</option>
        </Select>
        {createState.billingOption === 1 ? (
          <InputGroup>
            <InputLeftElement pointerEvents="none" h="100%">
              <ChakraImage src={NtnLogo} alt="NTN logo" h={"20px"} w={"auto"} />
            </InputLeftElement>
            <Input
              pl={10}
              placeholder={"Deposit NTN (e.g., 300, 5000, ...)"}
              size="lg"
              type="number"
              isDisabled={createState.isCreating}
              value={createState.initialCreateBalance}
              isInvalid={
                isNtnAmountInvalid(
                  ntn_balance,
                  createState.initialCreateBalance
                ) ||
                createCost + Number(createState.initialCreateBalance) >
                  e8sToIcp(Number(ntn_balance))
              }
              onChange={(event) =>
                createDispatch({
                  type: "SET_INITIAL_CREATE_BALANCE",
                  payload: event.target.value,
                })
              }
            />
            <InputRightElement width="4.5rem" h="100%">
              <Button
                rounded="full"
                boxShadow="base"
                _hover={{ opacity: "0.8" }}
                h="1.75rem"
                size="sm"
                isDisabled={createState.isCreating}
                onClick={() => {
                  const newAmount = e8sToIcp(Number(ntn_balance)) - createCost;
                  createDispatch({
                    type: "SET_INITIAL_CREATE_BALANCE",
                    payload: newAmount.toString() || "",
                  });
                }}
              >
                Max
              </Button>
            </InputRightElement>
          </InputGroup>
        ) : null}
      </Flex>

      {logged_in ? (
        <>
          <Button
            onClick={onOpen}
            rounded="full"
            boxShadow="base"
            w="100%"
            colorScheme="blue"
            isDisabled={
              createState.disburseDestination === "" ||
              (createState.disburseDestination !== "" &&
                !isAccountOkay(createState.disburseDestination)) ||
              createState.maturityDestination === "" ||
              (createState.maturityDestination !== "" &&
                !isAccountOkay(createState.maturityDestination)) ||
              !isDelayOkay(createState.dissolveDelay) ||
              (createState.billingOption === 1 &&
                createState.initialCreateBalance === "") ||
              isNtnAmountInvalid(
                ntn_balance,
                createState.initialCreateBalance
              ) ||
              createCost + Number(createState.initialCreateBalance) >
                e8sToIcp(Number(ntn_balance)) ||
              createState.followee === ""
            }
          >
            Create
          </Button>

          <Modal isOpen={isOpen} onClose={closeModal} isCentered>
            <ModalOverlay />
            <ModalContent
              bg={colorMode === "light" ? lightColorBox : darkColorBox}
            >
              <ModalHeader sx={{ textAlign: "center" }}>
                Create vector
              </ModalHeader>
              {!createState.isCreating ? <ModalCloseButton /> : null}
              <ModalBody>
                {createState.isCreated ? (
                  <Fireworks autorun={{ speed: 3, duration: 3 }} />
                ) : null}
                {!createState.isCreated ? (
                  <VStack align="start" p={3} gap={3}>
                    <LabelBox
                      label={"Maturity destination"}
                      data={createState.maturityDestination}
                    />
                    <LabelBox
                      label={"Disburse destination"}
                      data={createState.disburseDestination}
                    />
                    <LabelBox
                      label={"Dissolve delay"}
                      data={
                        createState.dissolveDelay === 184
                          ? "6 months"
                          : createState.dissolveDelay === 3000
                          ? "8 years"
                          : daysToMonthsAndYears(createState.dissolveDelay)
                      }
                    />
                    <LabelBox
                      label={"Followee"}
                      data={
                        createState.followee === "Default"
                          ? "Rakeoff.io"
                          : createState.followee
                      }
                    />
                    <LabelBox
                      label={"Billing option"}
                      data={
                        createState.billingOption
                          ? "3.17 NTN per day"
                          : "5% of Maturity"
                      }
                    />
                    <InfoRow
                      title={"Total create cost"}
                      stat={`${(
                        Number(createCost) +
                        Number(createState.initialCreateBalance)
                      ).toFixed(2)} NTN`}
                    />
                    {createState.isError ? (
                      <Text size="sm" color="red.500">
                        <WarningIcon /> {createState.isError}
                      </Text>
                    ) : null}
                  </VStack>
                ) : null}
                {createState.isCreated && !createState.isError ? (
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
                  colorScheme="blue"
                  isLoading={createState.isCreating}
                  onClick={
                    createState.isCreated
                      ? closeModal
                      : () =>
                          createDispatch({
                            type: "SET_IS_ERROR",
                            payload: "Can't create",
                          })
                  }
                >
                  {!createState.isCreated ? "Confirm vector" : null}
                  {createState.isCreated && !createState.isError
                    ? "Vector created"
                    : null}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      ) : (
        <Auth />
      )}
    </>
  );
};

export default CreateVector;
