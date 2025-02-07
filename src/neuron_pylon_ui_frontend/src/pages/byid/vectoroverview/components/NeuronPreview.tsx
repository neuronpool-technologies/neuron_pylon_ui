import React from "react";
import {
  Box,
  useColorMode,
  Flex,
  Text,
  Image as ChakraImage,
  VStack,
} from "@chakra-ui/react";
import IcLogo from "../../../../../assets/ic-logo.png";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { NavLink, useLocation } from "react-router-dom";
import {
  darkBorderColor,
  darkGrayTextColor,
  lightBorderColor,
  lightColorBox,
  lightGrayTextColor,
  lightGrayTokenBg,
} from "@/colors";
import { Shared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { daysToMonthsAndYears, e8sToIcp } from "@/tools/conversions";
import { LabelBox } from "@/components";

type NeuronPreviewProps = {
  controller: string;
  vectorid: string;
  module: Shared;
};

const NeuronPreview = ({
  controller,
  vectorid,
  module,
}: NeuronPreviewProps) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const location = useLocation();

  const neuronId = module.devefi_jes1_icpneuron.cache.neuron_id[0].toString();
  const neuronStake = Number(
    module.devefi_jes1_icpneuron.cache.cached_neuron_stake_e8s[0]
  );

  const dissolveDelaySeconds =
    module.devefi_jes1_icpneuron.cache.dissolve_delay_seconds[0];

  const dissolveDelay = daysToMonthsAndYears(
    Number(dissolveDelaySeconds) / (60 * 60 * 24)
  );

  let neuronStatus: string;
  if (module.devefi_jes1_icpneuron.cache.state[0] === 1) {
    neuronStatus = "Locked";
  } else if (module.devefi_jes1_icpneuron.cache.state[0] === 3) {
    neuronStatus = "Unlocked";
  } else {
    neuronStatus = "Dissolving";
  }

  const spawningTotal =
    module.devefi_jes1_icpneuron.internals.spawning_neurons.reduce(
      (accumulator, neuron) =>
        accumulator +
        Number(neuron.maturity_e8s_equivalent[0]) +
        Number(neuron.cached_neuron_stake_e8s[0]),
      0
    );

  return (
    <Box w="100%">
      <NavLink
        to={`/vectors/${controller}/${vectorid}/${module.devefi_jes1_icpneuron.cache.neuron_id[0]}`}
        state={{ from: location.state?.from }}
      >
        <Box
          w="100%"
          _hover={{
            cursor: "pointer",
          }}
          border={
            colorMode === "light"
              ? `solid ${lightBorderColor} 1px`
              : `solid ${darkBorderColor} 1px`
          }
          borderRadius="md"
          p={3}
        >
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
                Neuron {`${neuronId.slice(0, 5)}...${neuronId.slice(-3)}`}
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
            <LabelBox
              label="Staked"
              data={`${e8sToIcp(neuronStake).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} ICP`}
            />
            <LabelBox label="Incoming maturity">
              <Text noOfLines={1} color="green.500" as={"b"}>
                +
                {e8sToIcp(spawningTotal).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ICP
              </Text>
            </LabelBox>
          </Flex>
          <Flex align="center" my={3} gap={3} direction={"row"}>
            <LabelBox label="Dissolve delay" data={dissolveDelay} />
            <LabelBox label="Neuron status" data={neuronStatus} />
          </Flex>
        </Box>
      </NavLink>
    </Box>
  );
};

export default NeuronPreview;
