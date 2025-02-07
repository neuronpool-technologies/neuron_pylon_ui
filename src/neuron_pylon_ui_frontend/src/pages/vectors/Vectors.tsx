import React from "react";
import {
  Box,
  Heading,
  Divider,
  VStack,
  Spacer,
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
import { NavLink } from "react-router-dom";
import { useTypedSelector } from "@/hooks/hooks";
import { YourVectors, YourVectorsProfile } from "./components";
import { VectorsFaq } from "@/components";

const Vectors = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { logged_in, vectors, principal } = useTypedSelector(
    (state) => state.Profile
  );

  return (
    <Container maxW="xl" my={5}>
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
          <Spacer />
        </Flex>
        <VStack spacing={3} align="start">
          <Divider />
          <YourVectors />
        </VStack>
      </Box>
      <VectorsFaq />
    </Container>
  );
};

export default Vectors;
