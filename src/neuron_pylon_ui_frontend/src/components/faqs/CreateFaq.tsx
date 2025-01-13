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
    title: "What are neuron vectors?",
    body: "A neuron vector is like a box with a stake source account, custom destination accounts and some parameters to define what type of neuron you want like how long the delay should be and the followee. Users can send ICP to the stake source and it will get staked in an ICP neuron they control. The vector then automatically will spawn any maturity, claim it and send it to the destination account.",
  },
  {
    title: "Why create a neuron vector?",
    body: "ICP neuron vectors automate the staking process by eliminating tedious tasks such as maturity spawning, claiming, and followee setting, enabling everyone—from individual users to large teams or DAOs—to focus on their core objectives. This also unlocks new DeFi possibilities, such as automatically distributing maturity to multiple addresses, allocating maturity rewards toward specific token purchases, and integrating with throttle, splitting, and liquidity vectors across the broader vector ecosystem.",
  },
  {
    title: "Is it decentralized?",
    body: "The canister smart contract that enables users to create, edit, and stake neurons in vectors is open-source, decentralized, and governed by the Neutrinite DAO (Canister ID: 6jvpj-sqaaa-aaaaj-azwnq-cai). This user interface is an affiliate service managed by NeuronPool.",
  },
  {
    title: "Are there any fees?",
    body: "There are two billing options available for ICP neuron vectors: a 5% fee on any neuron maturity, or a daily rate of 3.17 NTN tokens. Users can choose the option that best suits their needs.",
  },
  {
    title: "What are the risks?",
    body: "There are potential risks such as canister exploits, hacks, or UI bugs. Users should always do their own research (DYOR) when engaging with any crypto platform. To help mitigate these risks, we conduct internal audits, open-source the code for community feedback, perform tests with PIC.js, and implement end-to-end UI testing.",
  },
];

const CreateFaq = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Box>
      <Flex mt={6}>
        <Text
          fontWeight="bold"
          color={colorMode === "light" ? darkColor : lightColor}
        >
          Create FAQ
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

export default CreateFaq;
