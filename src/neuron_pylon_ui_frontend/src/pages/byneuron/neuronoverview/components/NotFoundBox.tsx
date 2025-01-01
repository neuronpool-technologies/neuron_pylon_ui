import React from "react";
import { Heading, VStack, Flex, Text } from "@chakra-ui/react";
import { Hashicon } from "@emeraldpay/hashicon-react";

type NotFoundBoxProps = { id : string, neuron: string };

const NotFoundBox = ({ id, neuron }: NotFoundBoxProps) => {
  return (
    <Flex align="center" justify="center" w="100%" h={300}>
      <VStack>
        <Hashicon value={id} size={45} />
        <Heading textAlign="center" size={["sm", null, "md"]}>
          Neuron not found :(
        </Heading>
        <Text maxW="sm" textAlign="center" color="gray.500">
          Neuron: {neuron}
        </Text>
        <Text maxW="sm" textAlign="center" color="gray.500">
          Was not found on vector #{id}
        </Text>
      </VStack>
    </Flex>
  );
};

export default NotFoundBox;
