import React from "react";
import {
  Heading,
  VStack,
  Flex,
  Text,
  useColorMode,
  Avatar,
} from "@chakra-ui/react";
import { darkGrayTextColor, lightGrayTextColor } from "@/colors";

type NotFoundBoxProps = { controller: string };

const NotFoundBox = ({ controller }: NotFoundBoxProps) => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Flex align="center" justify="center" w="100%" h={300}>
      <VStack>
        <Avatar
          h={45}
          w={45}
          src={`https://identicons.github.com/${controller.slice(0, 3)}.png`}
          name={controller}
          ignoreFallback
        />
        <Heading textAlign="center" size={["sm", null, "md"]}>
          Controller {controller} not found :(
        </Heading>
        <Text
          maxW="sm"
          textAlign="center"
          color={colorMode === "light" ? lightGrayTextColor : darkGrayTextColor}
        >
          Please try another controller
        </Text>
      </VStack>
    </Flex>
  );
};

export default NotFoundBox;
