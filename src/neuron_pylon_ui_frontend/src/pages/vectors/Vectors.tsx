import React from "react";
import {
  Box,
  Heading,
  Divider,
  VStack,
  Text,
  Spacer,
  useColorMode,
  Flex,
  Container,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  darkColorBox,
  lightColorBox,
  lightBorderColor,
  darkBorderColor,
  lightGrayTextColor,
  darkGrayTextColor,
} from "@/colors";
import { NavLink } from "react-router-dom";
import { useTypedSelector } from "@/hooks/hooks";
import { YourVectors, YourVectorsProfile } from "./components";

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
          {logged_in && vectors.length > 0 ? (
            <NavLink to={`/vectors/${principal}`}>
              <Text
                textAlign={"end"}
                fontSize={"sm"}
                color={
                  colorMode === "light" ? lightGrayTextColor : darkGrayTextColor
                }
                fontWeight={500}
              >
                See all <ChevronRightIcon />
              </Text>
            </NavLink>
          ) : null}
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
