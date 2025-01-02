import React from "react";
import {
  useColorMode,
  Box,
  Text,
  Flex,
  Image as ChakraImage,
  VStack,
  Spacer,
  Badge,
} from "@chakra-ui/react";
import {
  Shared,
  SharedNeuronCache,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import IcLogo from "../../../../../assets/ic-logo.png";
import { convertSecondsToDaysOrHours, e8sToIcp } from "@/tools/conversions";
import {
  darkBorderColor,
  darkGrayColorBox,
  lightBorderColor,
  lightColorBox,
  lightGrayColorBox,
  lightGrayTokenBg,
} from "@/colors";
import { HintPopover } from "@/components";

type SpawningMaturityProps = {
  module: Shared;
};

const SpawningMaturity = ({ module }: SpawningMaturityProps) => {
    const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box>
      <Flex align="center" gap={1} mb={3}>
        <Text fontWeight="bold" fontSize={"md"}>
          Spawning maturity
        </Text>
        <HintPopover details="ICP amounts may vary by up to ±5% due to maturity modulation" />
      </Flex>
      <Flex gap={3} direction="column">
        {module.devefi_jes1_icpneuron.internals.spawning_neurons.length > 0 ? (
          <>
            {module.devefi_jes1_icpneuron.internals.spawning_neurons.map(
              (neuron, index) => (
                <SpawningNeuronProgress key={index} spawningNeuron={neuron} />
              )
            )}
          </>
        ) : (
            <Box
              bg={colorMode === "light" ? lightGrayColorBox : darkGrayColorBox}
              borderRadius="md"
              p={3}
              w="100%"
            >
              <Text>None</Text>
            </Box>
        )}
      </Flex>
    </Box>
  );
};

export default SpawningMaturity;

type SpawningNeuronProgressProps = {
  spawningNeuron: SharedNeuronCache;
};

const SpawningNeuronProgress = ({
  spawningNeuron,
}: SpawningNeuronProgressProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box
      w="100%"
      border={
        colorMode === "light"
          ? `solid ${lightBorderColor} 1px`
          : `solid ${darkBorderColor} 1px`
      }
      borderRadius="md"
      p={3}
    >
      <Flex align="center" w="100%" h="100%">
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
            {spawningNeuron.state[0] === 4
              ? e8sToIcp(
                  Number(spawningNeuron.maturity_e8s_equivalent[0])
                ).toFixed(4)
              : e8sToIcp(
                  Number(spawningNeuron.cached_neuron_stake_e8s[0])
                ).toFixed(4)}{" "}
            ICP
          </Text>
          <Text fontSize={"sm"} color="gray.500" noOfLines={1}>
            {Number(spawningNeuron.dissolve_delay_seconds[0]) > 0
              ? `${convertSecondsToDaysOrHours(
                  Number(spawningNeuron.dissolve_delay_seconds[0])
                )} left`
              : "Awaiting claim"}
          </Text>
        </VStack>
        <Spacer />
        {spawningNeuron.state[0] === 4 ? (
          <Badge
            variant="outline"
            colorScheme="orange"
            animation="pulse_orange 2s infinite"
          >
            Spawning
          </Badge>
        ) : (
          <Badge variant="outline" colorScheme="green">
            Ready
          </Badge>
        )}
      </Flex>
    </Box>
  );
};
