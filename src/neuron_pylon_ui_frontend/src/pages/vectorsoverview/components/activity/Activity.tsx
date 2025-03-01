import { Heading, Flex, Separator } from "@chakra-ui/react";

const Activity = () => {
  return (
    <Flex
      bg="bg.subtle"
      boxShadow={"md"}
      mt={6}
      borderRadius={"md"}
      direction={"column"}
      w="100%"
    >
      <Heading p={3}>Recent Activity</Heading>
      <Separator />
    </Flex>
  );
};

export default Activity;
