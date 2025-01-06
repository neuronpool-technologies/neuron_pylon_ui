import React from "react";
import {
  Box,
  Heading,
  Divider,
  VStack,
  useColorMode,
  Flex,
  Container,
} from "@chakra-ui/react";
import {
  darkColorBox,
  lightColorBox,
  lightBorderColor,
  darkBorderColor,
} from "@/colors";
import YourVectors from "./yourvectors/YourVectors";

const Vectors = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Container maxW="xl" my={5}>
      <Box
        boxShadow="md"
        borderRadius="lg"
        p={3}
        border={
          colorMode === "light"
            ? `solid ${lightBorderColor} 1px`
            : `solid ${darkBorderColor} 1px`
        }
        bg={colorMode === "light" ? lightColorBox : darkColorBox}
      >
        <Flex align="center" mb={3}>
          <Heading size={"md"} noOfLines={1}>
            Create
          </Heading>
        </Flex>
        <VStack spacing={3} align="start">
          <Divider />
          <p>create box TODO</p>
        </VStack>
      </Box>
      <YourVectors />
    </Container>
  );
};

export default Vectors;
