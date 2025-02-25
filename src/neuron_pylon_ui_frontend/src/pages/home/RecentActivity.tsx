import {
  Flex,
  Heading,
  Separator,
} from "@chakra-ui/react";

const RecentActivity = () => {
  return (
    <Flex
      bg="bg"
      boxShadow={"md"}
      mt={8}
      borderRadius={"md"}
      direction={"column"}
      p={3}
      gap={3}
      w="100%"
    >
      <Heading>Recent Activity</Heading>
      <Separator />
    </Flex>
  )
}

export default RecentActivity