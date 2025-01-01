import React from "react";
import {
  useColorMode,
  Flex,
  Text,
  Image as ChakraImage,
  VStack,
} from "@chakra-ui/react";
import IcLogo from "../../../../assets/ic-logo.png";
import { lightColorBox, lightGrayTokenBg } from "@/colors";
import { Shared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { e8sToIcp } from "@/tools/conversions";
import { RecentActivity, VariablesAndCache } from "./components";

type NeuronProps = {
  module: Shared;
};

const NeuronOverview = ({ module }: NeuronProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const neuronId = module.devefi_jes1_icpneuron.cache.neuron_id[0].toString();
  const neuronStake = Number(
    module.devefi_jes1_icpneuron.cache.cached_neuron_stake_e8s[0]
  );

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
            {e8sToIcp(neuronStake).toFixed(4)} ICP
          </Text>
          <Text fontSize={"sm"} color="gray.500" noOfLines={1}>
            Neuron: {neuronId}
          </Text>
        </VStack>
      </Flex>
      <VariablesAndCache module={module} />
      <RecentActivity module={module} />
    </Flex>
  );
};

export default NeuronOverview;
