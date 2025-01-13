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
    title: "How do neuron vectors work?",
    body: "Neuron vectors are created in the “Neuron Pylon,” governed by the Neutrinite DAO. Once an ICP neuron vector is set up, its stake source becomes active, allowing it to receive ICP tokens and stake an ICP neuron. Once a neuron is created, the vector automatically monitors it for maturity to send to the destination.",
  },
  {
    title: "What can I do with my neuron vector?",
    body: "You can view the vector’s source, destination, and billing information, monitor the neuron and incoming maturity, and edit settings—such as dissolving the neuron, transferring ownership, changing its followee, adjusting the vector’s destinations, or increasing the dissolve delay (up to a maximum of eight years).",
  },
  {
    title: "Are there other types of vectors?",
    body: "There are many other types of vectors—such as swap, splitter, and throttle vectors. However, this user interface only supports neuron vectors from the Neuron Pylon, so please do not send other vector types here.",
  },
];

const VectorsFaq = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Box>
      <Flex mt={6}>
        <Text
          fontWeight="bold"
          color={colorMode === "light" ? darkColor : lightColor}
        >
          Vectors FAQ
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

export default VectorsFaq;
