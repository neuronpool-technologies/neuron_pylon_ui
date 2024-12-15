import React from "react";
import { useColorMode, Text, Flex } from "@chakra-ui/react";
import {
  darkGrayTextColor,
  lightGrayTextColor,
  lightBorderColor,
  darkBorderColor,
} from "../colors";
import { TimeIcon } from "@chakra-ui/icons";

const ProcessTime = ({ estimate }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Flex
      align="center"
      gap={1}
      w="100%"
      border={
        colorMode === "light"
          ? `solid ${lightBorderColor} 1px`
          : `solid ${darkBorderColor} 1px`
      }
      borderRadius="md"
      p={3}
      mb={3}
      justify="center"
      color={colorMode === "light" ? lightGrayTextColor : darkGrayTextColor}
    >
      <TimeIcon />
      <Text noOfLines={1}>This may take about {estimate}</Text>
    </Flex>
  );
};

export default ProcessTime;