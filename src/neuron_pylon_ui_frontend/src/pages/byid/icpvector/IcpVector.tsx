import React from "react";
import { VStack, Flex, Spacer, Text, Badge } from "@chakra-ui/react";
import "../../../../assets/main.css";
import { Hashicon } from "@emeraldpay/hashicon-react";
import { DestinationBox, SourceBox } from "./components";
import { NodeShared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";

const IcpNeuronVector = ({ icpvector }: { icpvector: NodeShared }) => {
  return (
    <>
      <Flex align="center" w="100%">
        <Flex mr={3}>
          <Hashicon value={icpvector.id.toString()} size={45} />
        </Flex>
        <VStack align="start" spacing="0">
          <Text fontWeight="bold" fontSize={{ base: "sm", md: "lg" }}>
            Vector #{icpvector.id}
          </Text>
          <Text fontSize={"sm"} color="gray.500">
            ICP Neuron Vector
          </Text>
        </VStack>
        <Spacer />
        {icpvector.active && !icpvector.billing.frozen ? (
          <Badge
            variant="outline"
            colorScheme="green"
            animation="pulse 2s infinite"
          >
            Active
          </Badge>
        ) : (
          <Badge variant="outline" colorScheme="red">
            Frozen
          </Badge>
        )}
      </Flex>
      <Flex direction="column" mt={3} gap={3}>
        <SourceBox source={icpvector.sources[0]} />
        <DestinationBox destination={icpvector.destinations[0]} />
        <DestinationBox destination={icpvector.destinations[1]} />
      </Flex>
    </>
  );
};

export default IcpNeuronVector;
