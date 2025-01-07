import React from "react";
import {
  VStack,
  Flex,
  Spacer,
  Text,
  Badge,
  Divider,
  useColorMode,
} from "@chakra-ui/react";
import "../../../../assets/main.css";
import { Hashicon } from "@emeraldpay/hashicon-react";
import {
  DestinationBox,
  SourceBox,
  NeuronPreview,
  ControllersBox,
  BillingBox,
} from "./components";
import { NodeShared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { darkGrayTextColor, lightGrayTextColor } from "@/colors";

type VectorOverviewProps = {
  controller: string;
  vector: NodeShared;
};

const VectorOverview = ({ controller, vector }: VectorOverviewProps) => {
  const { colorMode, toggleColorMode } = useColorMode();
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
          <Text
            fontSize={"sm"}
            color={
              colorMode === "light" ? lightGrayTextColor : darkGrayTextColor
            }
            fontWeight={500}
          >
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
          controller={controller}
          vectorid={vector.id.toString()}
          module={vector.custom[0]}
        />
      ) : null}
      <SourceBox source={vector.sources[0]} />
      <Divider />
      <DestinationBox destinations={vector.destinations} />
      <Divider />
      <BillingBox vector={vector} />
      <Divider />
      <ControllersBox controllers={vector.controllers} />
    </Flex>
  );
};

export default VectorOverview;
