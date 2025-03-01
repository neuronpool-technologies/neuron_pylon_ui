import { Heading, Flex, Separator } from "@chakra-ui/react";

const Faq = () => {
  return (
    <Flex
      bg="bg.subtle"
      boxShadow={"md"}
      mt={6}
      borderRadius={"md"}
      direction={"column"}
      w="100%"
    >
      <Heading p={3}>FAQ</Heading>
      <Separator />
    </Flex>
  );
};

export default Faq;
