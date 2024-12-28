import React from "react";
import {
  Box,
  useColorMode,
  Flex,
  Spacer,
  Text,
  Image as ChakraImage,
  VStack,
} from "@chakra-ui/react";
import IcLogo from "../../../../../assets/ic-logo.png";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { NavLink } from "react-router-dom";
import {
  darkBorderColor,
  lightBorderColor,
  lightColorBox,
  lightGrayTokenBg,
} from "@/colors";
import { Shared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { e8sToIcp } from "@/tools/conversions";

type NeuronPreviewProps = {
  vectorid: string;
  module: Shared;
};

const NeuronPreview = ({ vectorid, module }: NeuronPreviewProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const neuronId = module.devefi_jes1_icpneuron.cache.neuron_id[0].toString();
  const neuronStake = Number(
    module.devefi_jes1_icpneuron.cache.cached_neuron_stake_e8s[0]
  );

  return (
    <NavLink
      to={`/id/${vectorid}/${module.devefi_jes1_icpneuron.cache.neuron_id[0]}`}
    >
      <Box
        w="100%"
        transition="transform 0.3s"
        _hover={{
          boxShadow:
            colorMode === "light"
              ? `0px 0px 5px ${lightGrayTokenBg}`
              : `0px 0px 5px ${lightColorBox}`,
        }}
        border={
          colorMode === "light"
            ? `solid ${lightBorderColor} 1px`
            : `solid ${darkBorderColor} 1px`
        }
        borderRadius="md"
        p={3}
      >
        <Flex align="center" w="100%s">
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
            <Text fontSize={"sm"} color="gray.500">
              Neuron: {`${neuronId.substring(0, 5)}...`}
            </Text>
          </VStack>
          <Spacer />
          <Text fontSize="sm" color="gray.500">
            See more <ChevronRightIcon />
          </Text>
        </Flex>
      </Box>
    </NavLink>
  );
};

export default NeuronPreview;
