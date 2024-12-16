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
} from "../../colors";
import { Create, CreateBalance, VectorInfo } from "./components";
import { useSelector } from "react-redux";

const Vectors = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const logged_in = useSelector((state) => state.Profile.logged_in);

  return (
    <Container maxW="xl" my={5}>
      {logged_in ? <CreateBalance /> : null}
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
          <Create />
          <VectorInfo />
        </VStack>
      </Box>
    </Container>
  );
};

export default Vectors;
