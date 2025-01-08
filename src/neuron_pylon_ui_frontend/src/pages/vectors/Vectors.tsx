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
import { useTypedSelector } from "@/hooks/hooks";
import { Create, CreateInfo, CreateProfile } from "./create";
import { YourVectors, YourVectorsProfile } from "./yourvectors";

const Vectors = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { logged_in } = useTypedSelector((state) => state.Profile);

  return (
    <Container maxW="xl" my={5}>
      {logged_in ? <CreateProfile /> : null}
      <Box
        boxShadow="md"
        borderRadius="lg"
        p={3}
        mb={6}
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
          <Create />
          <CreateInfo />
        </VStack>
      </Box>
      {logged_in ? <YourVectorsProfile /> : null}
      <Box
        boxShadow="md"
        borderRadius="lg"
        mb={6}
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
            Your vectors
          </Heading>
        </Flex>
        <VStack spacing={3} align="start">
          <Divider />
          <YourVectors />
        </VStack>
      </Box>
    </Container>
  );
};

export default Vectors;
