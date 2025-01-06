import React from "react";
import {
  VStack,
  Flex,
  Spacer,
  Text,
  Badge,
  Box,
  useColorMode,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import "../../assets/main.css";
import { Hashicon } from "@emeraldpay/hashicon-react";
import { NodeShared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import {
  darkBorderColor,
  darkGrayTextColor,
  lightBorderColor,
  lightGrayTextColor,
} from "@/colors";
import { NavLink } from "react-router-dom";
import { e8sToIcp } from "@/tools/conversions";
import LabelBox from "./LabelBox";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";

type VectorPreviewProps = {
  vector: NodeShared;
  controller: string;
};

const VectorPreview = ({ vector, controller }: VectorPreviewProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const module = vector.custom[0];

  const neuronId = module.devefi_jes1_icpneuron.cache.neuron_id[0].toString();

  const spawningTotal =
    module.devefi_jes1_icpneuron.internals.spawning_neurons.reduce(
      (accumulator, neuron) =>
        accumulator +
        Number(neuron.maturity_e8s_equivalent[0]) +
        Number(neuron.cached_neuron_stake_e8s[0]),
      0
    );

  const maturityDestination = vector.destinations[0];

  if (!("ic" in maturityDestination.endpoint)) return;

  const destinationAddress = maturityDestination.endpoint.ic.account[0]
    ? encodeIcrcAccount({
        owner: maturityDestination.endpoint.ic.account[0].owner,
        subaccount: maturityDestination.endpoint.ic.account[0].subaccount[0],
      })
    : "None";
  return (
    <NavLink to={`/controller/${controller}/id/${vector.id}`}>
      <Box
        w="100%"
        transition="transform 0.3s"
        _hover={{
          transform: "translateY(-2px)",
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
        <Flex width={"100%"} align={"center"}>
          <Flex mr={3}>
            <Hashicon value={vector.id.toString()} size={45} />
          </Flex>
          <VStack align="start" spacing="0">
            <Text fontWeight="bold" fontSize={{ base: "sm", md: "lg" }}>
              Vector #{vector.id}
            </Text>
            <Text
              fontSize={"sm"}
              color={
                colorMode === "light" ? lightGrayTextColor : darkGrayTextColor
              }
            >
              See more <ChevronRightIcon />
            </Text>
          </VStack>
          <Spacer />
          {vector.active && !vector.billing.frozen ? (
            <Badge
              variant="outline"
              colorScheme="green"
              animation="pulse_green 2s infinite"
            >
              Active
            </Badge>
          ) : (
            <Badge variant="outline" colorScheme="red">
              Frozen
            </Badge>
          )}
        </Flex>
        {neuronId ? (
          <Flex mt={3} gap={3} w={"100%"} direction={"column"}>
            <Flex align={"center"} width={"100%"} gap={3}>
              <LabelBox label="Incoming maturity">
                <Text noOfLines={1} color="green.500" as={"b"}>
                  +{e8sToIcp(spawningTotal).toFixed(4)} ICP
                </Text>
              </LabelBox>
              <LabelBox label="Maturity destination" data={destinationAddress} />
            </Flex>
          </Flex>
        ) : null}
      </Box>
    </NavLink>
  );
};

export default VectorPreview;
