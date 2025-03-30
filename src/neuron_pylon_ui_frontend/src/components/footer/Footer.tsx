import {
  Flex,
  Spacer,
  Image as ChakraImage,
  Text,
  Code,
} from "@chakra-ui/react";
import { BiLinkExternal } from "react-icons/bi";
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
      <Flex direction={"column"} gap={0}>
        <Text
          fontSize="2xs"
          fontWeight={500}
          color="fg.muted"
          textTransform={"uppercase"}
        >
          Governed by Neutrinite DAO
        </Text>
        <a
          href={
            "https://dashboard.internetcomputer.org/canister/6jvpj-sqaaa-aaaaj-azwnq-cai"
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <Code
            fontSize="xs"
            color="fg.info"
            fontWeight={500}
            display="inline-flex"
            alignItems="center"
            gap={1}
            _hover={{ opacity: "0.8", cursor: "pointer" }}
          >
            6jvpj-sqaaa-aaaaj-azwnq-cai <BiLinkExternal />
          </Code>
        </a>
      </Flex>
      <Spacer />
      <Social />
    </Flex>
  );
};

export default Footer;
