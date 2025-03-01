import { Flex, Text } from "@chakra-ui/react";

type StatVectorProps = {
  name: string;
  children: React.ReactNode;
};

const StatVector = ({ name, children }: StatVectorProps) => {
  return (
    <Flex direction={"column"} gap={1} w={{ base: "100%", md: "auto" }}>
      <Text fontSize="sm" color="fg.muted" lineClamp={1}>
        {name}
      </Text>
      <Flex
        p={2.5}
        bg="bg.muted"
        justify="center"
        boxShadow="xs"
        borderRadius="md"
        w="100%"
        align="center"
        gap={2}
      >
        {children}
      </Flex>
    </Flex>
  );
};

export default StatVector;
