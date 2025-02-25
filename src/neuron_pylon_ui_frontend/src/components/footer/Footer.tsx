import {
  Box,
  Flex,
  Separator,
  Image as ChakraImage,
} from "@chakra-ui/react";
import logo from "../../../assets/logo.svg";
import Social from "./Social";

const Footer = () => {
  return (
    <Box w="100%" mt={6} bg="green">
      <Flex w="100%">
        <Separator mx={6} />
      </Flex>
      <Flex
        direction={{ base: "column", md: "row" }}
        my={4}
        mx={6}
        gap={3}
        align="center"
      >
        <ChakraImage src={logo} alt="NeuronPool logo" h={35} />
        <Social />
      </Flex>
    </Box>
  );
};

export default Footer;
