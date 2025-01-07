import React from "react";
import { Flex, Spinner, Text, useColorMode } from "@chakra-ui/react";
import { darkGrayTextColor, lightGrayTextColor } from "@/colors";

const LoadingBox = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Flex
      w="100%"
      align="center"
      justify="center"
      h="200px"
      direction="column"
      gap={3}
    >
      <Spinner
        color={colorMode === "light" ? lightGrayTextColor : darkGrayTextColor}
      />
      <Text
        size="sm"
        color={colorMode === "light" ? lightGrayTextColor : darkGrayTextColor}
        fontWeight={500}
      >
        One moment please...
      </Text>
    </Flex>
  );
};

export default LoadingBox;
