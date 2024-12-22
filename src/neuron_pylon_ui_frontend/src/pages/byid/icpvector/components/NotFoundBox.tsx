import React from "react";
import { Heading, VStack, Flex, Text } from "@chakra-ui/react";
import { Hashicon } from "@emeraldpay/hashicon-react";

type NotFoundBoxProps = { id: string };

const NotFoundBox = ({ id }: NotFoundBoxProps) => {
  return (
    <Flex align="center" justify="center" w="100%" h={300}>
      <VStack>
        <Hashicon value={id} size={45} />
        <Heading textAlign="center" size={["sm", null, "md"]}>
          Vector not found :(
        </Heading>
        <Text maxW="sm" textAlign="center" color="gray.500">
          Please try another vector
        </Text>
      </VStack>
    </Flex>
  );
};

export default NotFoundBox;
