import { useTypedSelector } from "@/hooks/useRedux";
import { Flex, Heading, Separator } from "@chakra-ui/react";
import { VectorPreview } from "@/components";

const RecentVectors = () => {
  const { vectors } = useTypedSelector((state) => state.Vectors);
  const latestVectors = [...vectors].reverse().slice(0, 6);

  return (
    <Flex
      bg="bg.subtle"
      boxShadow={"md"}
      mt={8}
      borderRadius={"md"}
      direction={"column"}
      p={3}
      gap={3}
      w="100%"
    >
      <Heading>Latest Vectors</Heading>
      <Separator />
      {latestVectors.map((vector) => (
        <VectorPreview key={vector.id} vector={vector} />
      ))}
    </Flex>
  );
};

export default RecentVectors;
