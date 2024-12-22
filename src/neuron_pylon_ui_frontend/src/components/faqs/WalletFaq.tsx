import React from "react";
import {
  Box,
  VStack,
  useColorMode,
  Flex,
  Text,
  Accordion,
} from "@chakra-ui/react";
import { darkColor, lightColor } from "@/colors";
import FaqItem from "./FaqItem";

const faqs = [
  {
    title: "What is a wallet?",
    body: "A wallet is used to store, manage, and transact with your cryptocurrency tokens. This wallet currently supports NTN tokens, which are necessary for creating vectors.",
  },
  {
    title: "What are NTN tokens?",
    body: "NTN tokens are governance tokens used within the Neutrinite DAO.",
  },
  {
    title: "How do I get NTN tokens?",
    body: "You can purchase NTN tokens on most ICP DEXes. Once you have the tokens, you can send them to your NeuronPool NTN address.",
  },
];

const WalletFaq = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Box>
      <Flex mt={6}>
        <Text
          fontWeight="bold"
          color={colorMode === "light" ? darkColor : lightColor}
        >
          Wallet FAQ
        </Text>
      </Flex>
      <Accordion defaultIndex={[0]} mt={3} w="100%" allowMultiple reduceMotion>
        <VStack gap={3}>
          {faqs.map(({ title, body }) => (
            <FaqItem key={title} title={title} body={body} />
          ))}
        </VStack>
      </Accordion>
    </Box>
  );
};

export default WalletFaq;
