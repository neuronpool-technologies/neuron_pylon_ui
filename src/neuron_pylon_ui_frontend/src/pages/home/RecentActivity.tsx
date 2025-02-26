import { useTypedSelector } from "@/hooks/useRedux";
import { Flex, Heading, Separator, Icon } from "@chakra-ui/react";
import { BiCog } from "react-icons/bi";
import { VectorPreview } from "@/components";

const RecentActivity = () => {
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
      <Heading>Recent Activity</Heading>
      <Separator />
      {/* {latestVectors.map((vector) => (
        <Icon fontSize={45} p={2} bg={"bg.emphasized"} borderRadius="full">
          <BiCog />
        </Icon>
      ))} */}
    </Flex>
  );
};

export default RecentActivity;
