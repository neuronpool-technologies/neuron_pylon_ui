import React from "react";
import {
  Box,
  VStack,
  useColorMode,
  Flex,
  Text,
} from "@chakra-ui/react";
import {
  lightBorderColor,
  darkBorderColor,
  lightGrayColorBox,
  darkGrayColorBox,
} from "@/colors";
import { e8sToIcp } from "@/tools/conversions";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import CopyAddress from "./CopyAddress";
import { SourceEndpointResp } from "@/declarations/neuron_pylon/neuron_pylon.did.js";

type SourceBoxProps = {
  source: SourceEndpointResp;
};

const SourceBox = ({ source }: SourceBoxProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  if (!("ic" in source.endpoint)) return;

  const sourceAddress = encodeIcrcAccount({
    owner: source.endpoint.ic.account.owner,
    subaccount: source.endpoint.ic.account.subaccount[0],
  });

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
      <Flex align="center" gap={6} mb={3}>
        <VStack align="start" spacing="0">
          <Text fontSize={"sm"} color="gray.500">
            Source
          </Text>
          <Text fontWeight="bold" fontSize={"md"}>
            {source.name}
          </Text>
        </VStack>
        <VStack align="start" spacing="0">
          <Text fontSize={"sm"} color="gray.500">
            Balance
          </Text>
          <Text fontWeight="bold" fontSize={"md"}>
            {e8sToIcp(Number(source.balance)).toFixed(4)} ICP
          </Text>
        </VStack>
      </Flex>
      <Box
        bg={colorMode === "light" ? lightGrayColorBox : darkGrayColorBox}
        borderRadius="md"
        p={3}
      >
        <Text>{sourceAddress}</Text>
        <CopyAddress address={sourceAddress} />
      </Box>
    </Box>
  );
};

export default SourceBox;
