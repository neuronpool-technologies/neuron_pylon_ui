import React from "react";
import {
  useColorMode,
  Flex,
  Text,
  Image as ChakraImage,
  VStack,
  Divider,
} from "@chakra-ui/react";
import IcLogo from "../../../../assets/ic-logo.png";
import {
  darkGrayTextColor,
  lightColorBox,
  lightGrayTextColor,
  lightGrayTokenBg,
} from "@/colors";
import { Shared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { IncomingMaturity, VariablesAndCache } from "./components";

type NeuronProps = {
  module: Shared;
};

const NeuronOverview = ({ module }: NeuronProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const neuronId = module.devefi_jes1_icpneuron.cache.neuron_id[0].toString();

  return (
    <Flex direction="column" gap={3} w="100%">
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
            Neuron {neuronId}
          </Text>
          <Text
            fontSize={"sm"}
            color={
              colorMode === "light" ? lightGrayTextColor : darkGrayTextColor
            }
            noOfLines={1}
            fontWeight={500}
          >
            ICP neuron
          </Text>
        </VStack>
      </Flex>
      <Divider />
      <VariablesAndCache module={module} />
      <Divider />
      <IncomingMaturity module={module} />
    </Flex>
  );
};

export default NeuronOverview;
