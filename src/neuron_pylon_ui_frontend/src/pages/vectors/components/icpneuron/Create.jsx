import React, { useReducer, useState } from "react";
import { initialCreateState, createReducer } from "./createReducer";
import {
  Input,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  Button,
  Image as ChakraImage,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
  Divider,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  Stepper,
  useSteps,
  Box,
  useColorMode,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { WarningIcon, TimeIcon, StarIcon } from "@chakra-ui/icons";
import IcLogo from "../../../../../assets/ic-logo.png";
import { e8sToIcp, icpToE8s } from "../../../../tools/conversions";
import { useSelector, useDispatch } from "react-redux";
import { Auth, InfoRow, ProcessTime } from "../../../../components";
import {
  lightBorderColor,
  darkBorderColor,
  lightColorBox,
  darkColorBox,
  darkColor,
  lightColor,
} from "../../../../colors";
import Fireworks from "react-canvas-confetti/dist/presets/fireworks";
import { Principal } from "@dfinity/principal";
import { fetchWallet } from "../../../../state/ProfileSlice";
import { showToast } from "../../../../tools/toast";

const steps = [{ description: "Approve ICP" }, { description: "Stake ICP" }];

const Create = () => {
  const { ntn_balance, logged_in, principal } = useSelector(
    (state) => state.Profile
  );
  const dispatch = useDispatch();

  const [createState, createDispatch] = useReducer(
    createReducer,
    initialCreateState
  );

  const handleChange = (event) => {
    createDispatch({
      type: "UPDATE_NODE",
      field: event.target.name,
      value: event.target.value,
    });
  };

  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [failed, setFailed] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  const closeModal = () => {
    createDispatch({ type: "CLEAR_NODE" });
    setCreating(false);
    setCreated(false);
    setFailed(false);
    setActiveStep(0);
    onClose();
  };

  return (
    <>
      <Text
        fontWeight="bold"
        color={colorMode === "light" ? darkColor : lightColor}
      >
        Destinations
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
          placeholder="Maturity destination"
          size="lg"
          name="destination_maturity"
          value={createState.destination_maturity}
          isDisabled={creating}
          onChange={handleChange}
        />
      </InputGroup>
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
          placeholder="Disburse destination"
          size="lg"
          name="destination_disburse"
          value={createState.destination_disburse}
          isDisabled={creating}
          onChange={handleChange}
        />
      </InputGroup>
      <Text
        fontWeight="bold"
        color={colorMode === "light" ? darkColor : lightColor}
      >
        ICP Neuron
      </Text>
      <InputGroup>
        <InputLeftElement pointerEvents="none" h="100%">
          <TimeIcon alt="Time icon" color="gray.300" h={"20px"} w={"auto"} />
        </InputLeftElement>
        <Input
          pl={10}
          placeholder="Delay days"
          size="lg"
          name="neuron_delay"
          value={createState.neuron_delay}
          isDisabled={creating}
          onChange={handleChange}
        />
      </InputGroup>
      <InputGroup>
        <InputLeftElement pointerEvents="none" h="100%">
          <StarIcon alt="Star icon" color="gray.300" h={"20px"} w={"auto"} />
        </InputLeftElement>
        <Input
          pl={10}
          placeholder="Followee"
          size="lg"
          name="neuron_followee"
          value={createState.neuron_followee}
          isDisabled={creating}
          onChange={handleChange}
        />
      </InputGroup>
      {logged_in ? (
        <>
          <Button
            onClick={onOpen}
            rounded="full"
            boxShadow="base"
            w="100%"
            colorScheme="blue"
            // isDisabled={
            //   (!staked && Number(ntn_balance) < Number(minimum_stake)) ||
            //   icpToE8s(Number(amount)) <
            //     Number(minimum_stake) + networkFeeE8s * 2 ||
            //   (!staked && icpToE8s(Number(amount)) > Number(icp_balance))
            // }
          >
            Create
          </Button>
        </>
      ) : (
        <Auth />
      )}
    </>
  );
};

export default Create;
