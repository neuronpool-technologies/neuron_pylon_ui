import { Heading, Flex, Separator } from "@chakra-ui/react";

const About = () => {
  return (
    <Flex
      bg="bg.subtle"
      boxShadow={"md"}
      mt={6}
      borderRadius={"md"}
      direction={"column"}
      w="100%"
    >
      <Heading p={3}>About</Heading>
      <Separator />
    </Flex>
  );
};

export default About;
