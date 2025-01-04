import React from "react";
import { Heading, VStack, Flex, Text, useColorMode } from "@chakra-ui/react";
import { Hashicon } from "@emeraldpay/hashicon-react";
import { darkGrayTextColor, lightGrayTextColor } from "@/colors";

type NotFoundBoxProps = { id: string; neuron: string };

const NotFoundBox = ({ id, neuron }: NotFoundBoxProps) => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Flex align="center" justify="center" w="100%" h={300}>
      <VStack>
        <Hashicon value={id} size={45} />
        <Heading textAlign="center" size={["sm", null, "md"]}>
          Neuron not found :(
        </Heading>
        <Text
          maxW="sm"
          textAlign="center"
          color={colorMode === "light" ? lightGrayTextColor : darkGrayTextColor}
        >
          Neuron: {neuron}
        </Text>
        <Text
          maxW="sm"
          textAlign="center"
          color={colorMode === "light" ? lightGrayTextColor : darkGrayTextColor}
        >
          Was not found on vector #{id}
        </Text>
      </VStack>
    </Flex>
  );
};

export default NotFoundBox;
