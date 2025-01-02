import React from "react";
import { VStack, Flex, Spacer, Text, Badge, Divider } from "@chakra-ui/react";
import "../../../../assets/main.css";
import { Hashicon } from "@emeraldpay/hashicon-react";
import {
  DestinationBox,
  SourceBox,
  NeuronPreview,
  ControllersBox,
} from "./components";
import { NodeShared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";

type VectorProps = {
  vector: NodeShared;
};

const VectorOverview = ({ vector }: VectorProps) => {
  const neuronId = vector.custom[0].devefi_jes1_icpneuron.cache.neuron_id[0]
    ? vector.custom[0].devefi_jes1_icpneuron.cache.neuron_id[0]
    : null;

  return (
    <Flex direction="column" gap={3} w="100%">
      <Flex align="center" w="100%">
        <Flex mr={3}>
          <Hashicon value={vector.id.toString()} size={45} />
        </Flex>
        <VStack align="start" spacing="0">
          <Text fontWeight="bold" fontSize={{ base: "sm", md: "lg" }}>
            Vector #{vector.id}
          </Text>
          <Text fontSize={"sm"} color="gray.500">
            ICP Neuron Vector
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
      <Divider />
      {neuronId ? (
        <NeuronPreview
          vectorid={vector.id.toString()}
          module={vector.custom[0]}
        />
      ) : null}
      <SourceBox source={vector.sources[0]} />
      <DestinationBox destinations={vector.destinations} />
      <ControllersBox controllers={vector.controllers} />
    </Flex>
  );
};

export default VectorOverview;
