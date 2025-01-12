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
    body: "A neuron vector is like a box with source account and custom destination accounts and some parameters to define what type of neuron you want like how long the delay should be and the followee. Users can send ICP to the stake source and it will get staked in an ICP neuron they control. The vector then automatically will spawn the maturity, claim it and send it to the destination account.",
  },
  {
    title: "Why create a neuron vector?",
    body: "ICP neuron vectors automate the staking process by eliminating tedious tasks like maturity spawning, claiming and followee setting. Enabling everyone—from individual users to large teams or DAOs—to focus on their core objectives. This automation not only reduces the need for manual oversight but also unlocks new DeFi possibilities, such as automatically distributing maturity to multiple addresses and enabling innovative DeFi strategies.",
  },
  {
    title: "Is it decentralised?",
    body: "The canister smart contract that enables users to create, manage, and stake neurons in vectors is open-source and governed by the Neutrinite DAO (Canister ID: 6jvpj-sqaaa-aaaaj-azwnq-cai). This interface (UI) is an affiliate service controlled by NeuronPool.",
  },
  {
    title: "Are there any fees?",
    body: "There are two billing options available for ICP neuron vectors: a 5% fee on any maturity from the neuron or a daily rate of 3.17 NTN tokens. Users should choose whichever option best fits their needs.",
  },
  {
    title: "What are the risks?",
    body: "There are potential risks such as canister exploits, hacks, UI bugs, etc. No DeFi application is 100% safe, and users should do their own research (DYOR) when using any crypto app. It is our mission to maintain a high-performing and secure application. We mitigate risks by pursuing audits, open-sourcing the code for feedback, unit testing the canister code and end-to-end testing the UI.",
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
