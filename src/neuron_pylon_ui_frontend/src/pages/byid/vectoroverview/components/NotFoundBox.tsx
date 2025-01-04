import React from "react";
import { Heading, VStack, Flex, Text, useColorMode } from "@chakra-ui/react";
import { Hashicon } from "@emeraldpay/hashicon-react";
import { darkGrayTextColor, lightGrayTextColor } from "@/colors";

type NotFoundBoxProps = { id: string };

const NotFoundBox = ({ id }: NotFoundBoxProps) => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Flex align="center" justify="center" w="100%" h={300}>
      <VStack>
        <Hashicon value={id} size={45} />
        <Heading textAlign="center" size={["sm", null, "md"]}>
          Neuron vector #{id} not found :(
        </Heading>
        <Text
          maxW="sm"
          textAlign="center"
          color={colorMode === "light" ? lightGrayTextColor : darkGrayTextColor}
        >
          Please try another vector
        </Text>
      </VStack>
    </Flex>
  );
};

export default NotFoundBox;
