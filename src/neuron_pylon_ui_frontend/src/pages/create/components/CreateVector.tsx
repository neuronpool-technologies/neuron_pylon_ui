import React, { useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  VStack,
  Divider,
  Icon,
} from "@chakra-ui/react";
import { LockIcon, WarningIcon, StarIcon } from "@chakra-ui/icons";
import IcLogo from "../../../../assets/ic-logo.png";
import NtnLogo from "../../../../assets/ntn-logo.png";
import { Auth, InfoRow, LabelBox } from "@/components";
import { useTypedDispatch, useTypedSelector } from "@/hooks/hooks";
import {
  daysToMonthsAndYears,
  e8sToIcp,
  icpToE8s,
  isAccountOkay,
  isDelayOkay,
  isNtnAmountInvalid,
  stringToIcrcAccount,
} from "@/tools/conversions";
import {
  darkColorBox,
  darkGrayTextColor,
  lightColorBox,
  lightGrayTextColor,
} from "@/colors";
import { initialCreateState, createReducer } from "./CreateReducer";
import { startNeuronPylonClient } from "@/client/Client";
import {
  CommonCreateRequest,
  CreateRequest,
  BatchCommandResponse,
} from "@/declarations/neuron_pylon/neuron_pylon.did";
import { fetchWallet } from "@/state/ProfileSlice";

const CreateVector = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { logged_in, principal, ntn_balance } = useTypedSelector(
    (state) => state.Profile
  );
  const { billing } = useTypedSelector((state) => state.Meta);

  const dispatch = useTypedDispatch();
  const navigate = useNavigate();

  const createCost =
    billing && "min_create_balance" in billing
      ? e8sToIcp(Number(billing.min_create_balance))
      : 0;

  const [creating, setCreating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [customDelay, setCustomDelay] = useState<boolean>(false);
  const [customFollowee, setCustomFollowee] = useState<boolean>(false);

  const [createState, createDispatch] = useReducer(
    createReducer,
    initialCreateState
  );

  const create = async () => {
    try {
      setErrorMsg("");
      setCreating(true);

      const pylon = await startNeuronPylonClient();

      const commonCreateRequest: CommonCreateRequest = {
        controllers: [stringToIcrcAccount(principal)],
        destinations: [
          [{ ic: stringToIcrcAccount(createState.maturityDestination) }],
          [{ ic: stringToIcrcAccount(createState.disburseDestination) }],
        ],
        refund: stringToIcrcAccount(principal),
        ledgers: [
          {
            ic: stringToIcrcAccount(
              process.env.REACT_APP_ICP_LEDGER_CANISTER_ID
            ).owner,
          },
        ],
        sources: [],
        extractors: [],
        affiliate: [stringToIcrcAccount(process.env.REACT_APP_AFFILIATE)],
        temporary: false,
        billing_option: BigInt(createState.billingOption),
        initial_billing_amount: [
          icpToE8s(Number(createState.initialCreateBalance)) +
            icpToE8s(Number(createCost)),
        ],
        temp_id: 0,
      };

      const createRequest: CreateRequest = {
        devefi_jes1_icpneuron: {
          variables: {
            dissolve_delay:
              createState.dissolveDelay === 184
                ? { Default: null }
                : { DelayDays: BigInt(createState.dissolveDelay) },
            dissolve_status: { Locked: null },
            followee:
              createState.followee === "Default"
                ? { Default: null }
                : { FolloweeId: BigInt(createState.followee) },
          },
        },
      };

      const response: BatchCommandResponse = await pylon.icrc55_command({
        expire_at: [],
        request_id: [],
        controller: stringToIcrcAccount(principal),
        signature: [],
        commands: [{ create_node: [commonCreateRequest, createRequest] }],
      });

      if (
        "ok" in response &&
        "create_node" in response.ok.commands[0] &&
        "ok" in response.ok.commands[0].create_node
      ) {
        dispatch(fetchWallet({ principal }));
        setCreating(false);
        createDispatch({ type: "RESET" });
        navigate(
          `/vectors/${principal}/${response.ok.commands[0].create_node.ok.id}`,
          {
            state: { created: true, from: "/vectors" },
          }
        );
      } else {
        setCreating(false);
        setErrorMsg(response.toString());
        createDispatch({ type: "RESET" });
      }
    } catch (error) {
      setCreating(false);
      setErrorMsg(error.toString());
      createDispatch({ type: "RESET" });
    }
  };

  const closeModal = () => {
    setCreating(false);
    setErrorMsg("");
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
            placeholder={"Principal, ICRC (e.g., ntohy-uex..., ...)"}
            size="lg"
            value={createState.maturityDestination}
            isInvalid={
              createState.maturityDestination !== "" &&
              !isAccountOkay(createState.maturityDestination)
            }
            isDisabled={creating}
            type="text"
            onChange={(event) =>
              createDispatch({
                type: "UPDATE_STATE",
                payload: {
                  key: "maturityDestination",
                  value: event.target.value,
                },
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
            placeholder={"Principal, ICRC (e.g., ntohy-uex..., ..)"}
            size="lg"
            value={createState.disburseDestination}
            isInvalid={
              createState.disburseDestination !== "" &&
              !isAccountOkay(createState.disburseDestination)
            }
            isDisabled={creating}
            type="text"
            onChange={(event) =>
              createDispatch({
                type: "UPDATE_STATE",
                payload: {
                  key: "disburseDestination",
                  value: event.target.value,
                },
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
          isDisabled={creating}
          onChange={(event) => {
            switch (event.target.value) {
              case "6months":
                createDispatch({
                  type: "UPDATE_STATE",
                  payload: { key: "dissolveDelay", value: 184 },
                });
                setCustomDelay(false);
                break;
              case "8years":
                createDispatch({
                  type: "UPDATE_STATE",
                  payload: { key: "dissolveDelay", value: 3000 },
                });
                setCustomDelay(false);
                break;
              default:
                setCustomDelay(true);
            }
          }}
        >
          <option value={"6months"}>6 months</option>
          <option value={"8years"}>8 years</option>
          <option value={"custom"}>Custom</option>
        </Select>
        {customDelay ? (
          <InputGroup>
            <InputLeftElement pointerEvents="none" h="100%">
              <LockIcon />
            </InputLeftElement>
            <Input
              pl={10}
              placeholder={"Days (e.g., 184, 2922, ...)"}
              size="lg"
              type="number"
              isDisabled={creating}
              isInvalid={!isDelayOkay(createState.dissolveDelay)}
              onChange={(event) =>
                createDispatch({
                  type: "UPDATE_STATE",
                  payload: {
                    key: "dissolveDelay",
                    value: Number(event.target.value),
                  },
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
          isDisabled={creating}
          onChange={(event) => {
            switch (event.target.value) {
              case "default":
                createDispatch({
                  type: "UPDATE_STATE",
                  payload: { key: "followee", value: "Default" },
                });
                setCustomFollowee(false);
                break;
              default:
                setCustomFollowee(true);
            }
          }}
        >
          <option value={"default"}>Rakeoff.io</option>
          <option value={"custom"}>Custom</option>
        </Select>
        {customFollowee ? (
          <InputGroup>
            <InputLeftElement pointerEvents="none" h="100%">
              <StarIcon />
            </InputLeftElement>
            <Input
              pl={10}
              placeholder={"Neuron ID (e.g., 6914974521667616512, ...)"}
              size="lg"
              type="number"
              isDisabled={creating}
              isInvalid={createState.followee === ""}
              onChange={(event) =>
                createDispatch({
                  type: "UPDATE_STATE",
                  payload: { key: "followee", value: event.target.value },
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
          isDisabled={creating}
          onChange={(event) => {
            createDispatch({
              type: "UPDATE_STATE",
              payload: {
                key: "billingOption",
                value: Number(event.target.value),
              },
            });

            if (!Number(event.target.value)) {
              createDispatch({
                type: "UPDATE_STATE",
                payload: { key: "initialCreateBalance", value: "" },
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
              isDisabled={creating}
              value={createState.initialCreateBalance}
              isInvalid={
                logged_in
                  ? isNtnAmountInvalid(
                      ntn_balance,
                      createState.initialCreateBalance
                    ) ||
                    createCost + Number(createState.initialCreateBalance) >
                      e8sToIcp(Number(ntn_balance))
                  : false
              }
              onChange={(event) =>
                createDispatch({
                  type: "UPDATE_STATE",
                  payload: {
                    key: "initialCreateBalance",
                    value: event.target.value,
                  },
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
                isDisabled={creating}
                onClick={() => {
                  const newAmount = e8sToIcp(Number(ntn_balance)) - createCost;
                  createDispatch({
                    type: "UPDATE_STATE",
                    payload: {
                      key: "initialCreateBalance",
                      value: newAmount.toString() || "",
                    },
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
              {!creating ? <ModalCloseButton /> : null}
              <ModalBody>
                <VStack align="start" p={3} gap={3}>
                  <Flex align="center" gap={3}>
                    <LabelBox
                      label={"Maturity destination"}
                      data={createState.maturityDestination}
                    />
                    <LabelBox
                      label={"Disburse destination"}
                      data={createState.disburseDestination}
                    />
                  </Flex>
                  <Flex align="center" gap={3} w="100%">
                    <LabelBox
                      label={"Dissolve delay"}
                      data={daysToMonthsAndYears(createState.dissolveDelay)}
                    />
                    <LabelBox
                      label={"Followee"}
                      data={
                        createState.followee === "Default"
                          ? "Rakeoff.io"
                          : createState.followee
                      }
                    />
                  </Flex>
                  <LabelBox
                    label={"Billing option"}
                    data={
                      createState.billingOption
                        ? "3.17 NTN per day"
                        : "5% of Maturity"
                    }
                  />
                  <InfoRow title={"Network fees"} stat={`0.0001 NTN`} />
                  <Divider />
                  <InfoRow
                    title={"Total create cost"}
                    stat={`${(
                      Number(createCost) +
                      Number(createState.initialCreateBalance)
                    ).toFixed(2)} NTN`}
                  />
                  {errorMsg ? (
                    <Text size="sm" color="red.500">
                      <WarningIcon /> {errorMsg}
                    </Text>
                  ) : null}
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Button
                  rounded="full"
                  boxShadow="base"
                  w="100%"
                  colorScheme="blue"
                  isLoading={creating}
                  onClick={create}
                >
                  Confirm vector
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
