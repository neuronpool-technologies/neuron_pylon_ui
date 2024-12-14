import React from "react";
import {
  VStack,
  useColorMode,
  Flex,
  Text,
  Image as ChakraImage,
  Container,
  Button,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import mascot from "../../../assets/mascot.svg";
import {
  darkColorBox,
  darkGrayTextColor,
  lightColorBox,
  lightGrayTextColor,
  lightBorderColor,
} from "../../colors";

const ErrorPage = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Container maxW="xl" my={5}>
      <Flex p={3} h="60vh" alignItems="center" justifyContent="center">
        <VStack gap={3}>
          <Flex>
            <Text
              boxShadow="md"
              borderRadius="lg"
              p={3}
              border={
                colorMode === "light"
                  ? `solid ${lightBorderColor} 1px`
                  : `solid ${lightBorderColor} 1px`
              }
              bg={colorMode === "light" ? lightColorBox : darkColorBox}
              color={
                colorMode === "light" ? lightGrayTextColor : darkGrayTextColor
              }
              fontWeight={500}
              transform="rotate(25deg)"
              ml="150px"
            >
              Error 404
            </Text>
          </Flex>
          <ChakraImage src={mascot} alt="NeuronPool mascot" h={100} />
          <Text
            boxShadow="md"
            borderRadius="lg"
            p={3}
            border={
              colorMode === "light"
                ? `solid ${lightBorderColor} 1px`
                : `solid ${lightBorderColor} 1px`
            }
            bg={colorMode === "light" ? lightColorBox : darkColorBox}
            color={
              colorMode === "light" ? lightGrayTextColor : darkGrayTextColor
            }
            fontWeight={500}
          >
            Oops, page not found.
          </Text>
          <NavLink to={`/`}>
            <Button rounded="full" boxShadow="base">
              Go home
            </Button>
          </NavLink>
        </VStack>
      </Flex>
    </Container>
  );
};

export default ErrorPage;
