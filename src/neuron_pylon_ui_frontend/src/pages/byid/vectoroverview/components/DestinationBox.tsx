import React from "react";
import { Box, VStack, useColorMode, Flex, Text } from "@chakra-ui/react";
import { lightGrayColorBox, darkGrayColorBox } from "@/colors";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { DestinationEndpointResp } from "@/declarations/neuron_pylon/neuron_pylon.did.js";

type DestinationBoxProps = {
  destinations: DestinationEndpointResp[];
};

const DestinationBox = ({ destinations }: DestinationBoxProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box>
      <Flex w="100%" direction="column" gap={3}>
        {destinations.map((destination, index) => {
          if (!("ic" in destination.endpoint)) return;

          const destinationAddress = destination.endpoint.ic.account[0]
            ? encodeIcrcAccount({
                owner: destination.endpoint.ic.account[0].owner,
                subaccount: destination.endpoint.ic.account[0].subaccount[0],
              })
            : "None";

          return (
            <Box key={index}>
              <Flex align="center" mb={3}>
                <VStack align="start" spacing="0">
                  <Text fontSize={"sm"} color="gray.500">
                    Destination
                  </Text>
                  <Text fontWeight="bold" fontSize={"md"}>
                    {destination.name}
                  </Text>
                </VStack>
              </Flex>
              <Box
                bg={
                  colorMode === "light" ? lightGrayColorBox : darkGrayColorBox
                }
                borderRadius="md"
                p={3}
              >
                <Text>{destinationAddress}</Text>
              </Box>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
};

export default DestinationBox;
