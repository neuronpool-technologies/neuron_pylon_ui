import React from "react";
import {
  useColorMode,
  Text,
  Flex,
  Image as ChakraImage,
  Spacer,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@chakra-ui/react";
import { TimeIcon } from "@chakra-ui/icons";
import {
  Shared,
  SharedNeuronCache,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import IcLogo from "../../../../../assets/ic-logo.png";
import { convertSecondsToDaysOrHours, e8sToIcp } from "@/tools/conversions";
import {
  darkGrayTextColor,
  lightColorBox,
  lightGrayTextColor,
  lightGrayTokenBg,
} from "@/colors";
import { HintPopover, LabelBox } from "@/components";

type IncomingMaturityProps = {
  module: Shared;
};

const IncomingMaturity = ({ module }: IncomingMaturityProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const spawningTotal =
    module.devefi_jes1_icpneuron.internals.spawning_neurons.reduce(
      (accumulator, neuron) =>
        accumulator +
        Number(neuron.maturity_e8s_equivalent[0]) +
        Number(neuron.cached_neuron_stake_e8s[0]),
      0
    );

  return (
    <Flex direction={"column"} gap={3}>
      <LabelBox label="Incoming maturity">
        <Flex align="center">
          <Text noOfLines={1} color="green.500" as={"b"}>
            +{e8sToIcp(spawningTotal).toFixed(2)} ICP
          </Text>
          <Spacer />
          <HintPopover details="ICP amounts may vary by up to ±5% due to maturity modulation and fees." />
        </Flex>
      </LabelBox>
      {module.devefi_jes1_icpneuron.internals.spawning_neurons.length > 0 ? (
        <TableContainer w="100%" h="100%">
          <Table variant="unstyled">
            <Thead>
              <Tr>
                <Th
                  px={3}
                  color={
                    colorMode === "light"
                      ? lightGrayTextColor
                      : darkGrayTextColor
                  }
                  fontWeight={500}
                  fontSize="md"
                  textTransform="none"
                  letterSpacing="none"
                  textAlign="start"
                >
                  Asset
                </Th>
                <Th
                  px={3}
                  color={
                    colorMode === "light"
                      ? lightGrayTextColor
                      : darkGrayTextColor
                  }
                  fontWeight={500}
                  fontSize="md"
                  textTransform="none"
                  letterSpacing="none"
                  textAlign="start"
                >
                  Amount
                </Th>
                <Th
                  px={3}
                  color={
                    colorMode === "light"
                      ? lightGrayTextColor
                      : darkGrayTextColor
                  }
                  fontWeight={500}
                  fontSize="md"
                  textTransform="none"
                  letterSpacing="none"
                  textAlign="end"
                >
                  Time left
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {module.devefi_jes1_icpneuron.internals.spawning_neurons.map(
                (neuron, index) => (
                  <IncomingNeuron key={index} incomingNeuron={neuron} />
                )
              )}
            </Tbody>
          </Table>
        </TableContainer>
      ) : null}
    </Flex>
  );
};

export default IncomingMaturity;

type IncomingNeuronProps = {
  incomingNeuron: SharedNeuronCache;
};

const IncomingNeuron = ({ incomingNeuron }: IncomingNeuronProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Tr
      borderTop={
        colorMode === "light" ? `solid #edf2f5 1px` : `solid #414951 1px`
      }
    >
      <Td px={3} textAlign="start">
        <Flex align="center">
          {incomingNeuron.state[0] === 4 ? (
            <TimeIcon
              bg={colorMode === "light" ? lightGrayTokenBg : lightColorBox}
              color={
                colorMode === "light" ? lightGrayTextColor : darkGrayTextColor
              }
              borderRadius="full"
              p={0.5}
              h={"22px"}
              w={"auto"}
            />
          ) : (
            <ChakraImage
              src={IcLogo}
              alt="ICP logo"
              bg={colorMode === "light" ? lightGrayTokenBg : lightColorBox}
              borderRadius="full"
              p={0.5}
              h={"22px"}
              w={"auto"}
            />
          )}
          &nbsp;
          <Text>ICP</Text>
        </Flex>
      </Td>
      <Td px={3} textAlign="start">
        <Text as="b" color="green.500">
          +
          {incomingNeuron.state[0] === 4
            ? e8sToIcp(
                Number(incomingNeuron.maturity_e8s_equivalent[0])
              ).toFixed(2)
            : e8sToIcp(
                Number(incomingNeuron.cached_neuron_stake_e8s[0])
              ).toFixed(2)}
        </Text>
      </Td>
      <Td textAlign="end">
        <Text>
          {Number(incomingNeuron.dissolve_delay_seconds[0]) > 0
            ? `${convertSecondsToDaysOrHours(
                Number(incomingNeuron.dissolve_delay_seconds[0])
              )} left`
            : "Awaiting claim"}
        </Text>
      </Td>
    </Tr>
  );
};
