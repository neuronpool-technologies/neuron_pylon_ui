import React from "react";
import {
  Box,
  useColorMode,
  Flex,
  Text,
  Image as ChakraImage,
  VStack,
  Center,
} from "@chakra-ui/react";
import IcLogo from "../../../../../assets/ic-logo.png";
import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  darkBorderColor,
  darkGrayTextColor,
  lightBorderColor,
  lightColorBox,
  lightGrayTextColor,
  lightGrayTokenBg,
} from "@/colors";
import { LabelBox } from "@/components";
import { Shared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { daysToMonthsAndYears } from "@/tools/conversions";

type NoNeuronBoxProps = {
  module: Shared;
};

const NoNeuronBox = ({ module }: NoNeuronBoxProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const delayVar = module.devefi_jes1_icpneuron.variables.dissolve_delay;

  let dissolveDelay: string;
  if ("DelayDays" in delayVar) {
    dissolveDelay = daysToMonthsAndYears(Number(delayVar.DelayDays));
  } else {
    dissolveDelay = daysToMonthsAndYears(184);
  }

  return (
    <Box
      position="relative" // So the absolute text can be placed relative to this container
      w="100%"
      border={
        colorMode === "light"
          ? `solid ${lightBorderColor} 1px`
          : `solid ${darkBorderColor} 1px`
      }
      borderRadius="md"
      p={3}
    >
      {/* Existing content, grayed out */}
      <Box opacity={0.2} pointerEvents="none">
        <Flex align="center" w="100%">
          <ChakraImage
            src={IcLogo}
            alt="ICP logo"
            bg={colorMode === "light" ? lightGrayTokenBg : lightColorBox}
            borderRadius="full"
            p={1}
            h={45}
            mr={3}
            w={45}
          />
          <VStack align="start" spacing="0">
            <Text fontWeight="bold" fontSize={{ base: "sm", md: "lg" }}>
              Neuron ...
            </Text>
            <Text
              fontSize={"sm"}
              color={
                colorMode === "light" ? lightGrayTextColor : darkGrayTextColor
              }
              noOfLines={1}
              fontWeight={500}
            >
              See more <ChevronRightIcon />
            </Text>
          </VStack>
        </Flex>
        <Flex align="center" my={3} gap={3} direction={"row"}>
          <LabelBox label="Staked" data={`00.00 ICP`} />
          <LabelBox label="Incoming maturity">
            <Text noOfLines={1} color="green.500" as={"b"}>
              +00.00 ICP
            </Text>
          </LabelBox>
        </Flex>
        <Flex align="center" my={3} gap={3} direction={"row"}>
          <LabelBox label="Dissolve delay" data={dissolveDelay} />
          <LabelBox label="Neuron status" data={"Locked"} />
        </Flex>
      </Box>

      {/* Overlayed "No neuron staked" text in the center */}
      <Center
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
      >
        <VStack align="center" spacing="0">
          <Text fontWeight="bold" fontSize={{ base: "sm", md: "lg" }}>
            No neuron staked!
          </Text>
          <Text
            color={
              colorMode === "light" ? lightGrayTextColor : darkGrayTextColor
            }
            fontSize="sm"
            fontWeight={500}
            textAlign={"center"}
          >
            Send at least 20 ICP to the stake source account below to
            stake a neuron.
          </Text>
        </VStack>
      </Center>
    </Box>
  );
};

export default NoNeuronBox;
