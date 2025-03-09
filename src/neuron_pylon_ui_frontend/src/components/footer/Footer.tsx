import { Flex, Spacer, Image as ChakraImage } from "@chakra-ui/react";
import logo from "../../../assets/logo.svg";
import Social from "./Social";

const Footer = () => {
  return (
    <Flex
      direction={"row"}
      gap={3}
      align="center"
      p={{ base: 3, md: 6 }}
      hideBelow={"md"}
    >
      <ChakraImage src={logo} alt="NeuronPool logo" h={35} />
      <Spacer />
      <Social />
    </Flex>
  );
};

export default Footer;
