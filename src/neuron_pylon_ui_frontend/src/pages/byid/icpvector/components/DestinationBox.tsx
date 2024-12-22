import React from "react";
import {
  Box,
  VStack,
  useColorMode,
  Flex,
  Spacer,
  Text,
} from "@chakra-ui/react";
import {
  lightBorderColor,
  darkBorderColor,
  lightGrayColorBox,
  darkGrayColorBox,
} from "@/colors";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import CopyAddress from "./CopyAddress";
import { DestinationEndpointResp } from "@/declarations/neuron_pylon/neuron_pylon.did.js";

const DestinationBox = ({
  destination,
}: {
  destination: DestinationEndpointResp;
}) => {
  const { colorMode, toggleColorMode } = useColorMode();

  if (!("ic" in destination.endpoint)) return;

  const destinationAddress = destination.endpoint.ic.account[0]
    ? encodeIcrcAccount({
        owner: destination.endpoint.ic.account[0].owner,
        subaccount: destination.endpoint.ic.account[0].subaccount[0],
      })
    : "None";

  return (
    <Box
      border={
        colorMode === "light"
          ? `solid ${lightBorderColor} 1px`
          : `solid ${darkBorderColor} 1px`
      }
      borderRadius="md"
      p={3}
    >
      <Flex align="center" mb={3}>
        <VStack align="start" spacing="0">
          <Text fontSize={"sm"} color="gray.500">
            Destination
          </Text>
          <Text fontWeight="bold" fontSize={"md"}>
            {destination.name}
          </Text>
        </VStack>
        <Spacer />
        <CopyAddress address={destinationAddress} />
      </Flex>
      <Box
        bg={colorMode === "light" ? lightGrayColorBox : darkGrayColorBox}
        borderRadius="md"
        p={3}
      >
        <Text noOfLines={3}>{destinationAddress}</Text>
      </Box>
    </Box>
  );
};

export default DestinationBox;
