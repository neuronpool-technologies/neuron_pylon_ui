import React from "react";
import { Box, VStack, useColorMode, Flex, Text } from "@chakra-ui/react";
import {
  darkBorderColor,
  darkColor,
  darkColorBox,
  lightBorderColor,
  lightColor,
  lightColorBox,
} from "@/colors";
import { useTypedSelector } from "@/hooks/hooks";

const YourVectors = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const vectors = useTypedSelector((state) => state.Profile.vectors);

  // Check
  console.log(vectors);
  return (
    <Box>
      <Flex mt={6}>
        <Text
          fontWeight="bold"
          color={colorMode === "light" ? darkColor : lightColor}
        >
          Your vectors
        </Text>
      </Flex>
      <Box
        boxShadow="md"
        borderRadius="lg"
        p={3}
        mt={3}
        border={
          colorMode === "light"
            ? `solid ${lightBorderColor} 1px`
            : `solid ${darkBorderColor} 1px`
        }
        bg={colorMode === "light" ? lightColorBox : darkColorBox}
      >
        <VStack align="start" p={3} gap={3}></VStack>
      </Box>
    </Box>
  );
};

export default YourVectors;
