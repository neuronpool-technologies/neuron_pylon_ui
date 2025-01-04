import React from "react";
import { Box, useColorMode, Flex } from "@chakra-ui/react";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { DestinationEndpointResp } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { LabelBox } from "@/components";

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
            <LabelBox
              key={index}
              label={`${destination.name} destination`}
              data={destinationAddress}
            />
          );
        })}
      </Flex>
    </Box>
  );
};

export default DestinationBox;
