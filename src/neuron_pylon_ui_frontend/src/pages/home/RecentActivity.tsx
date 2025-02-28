import { useTypedSelector } from "@/hooks/useRedux";
import { Flex, Heading, Separator, Text } from "@chakra-ui/react";
import { VectorLog } from "@/components";
import { BiRightArrowAlt } from "react-icons/bi";
import { NavLink } from "react-router-dom";

const RecentActivity = () => {
  const { latest_log } = useTypedSelector((state) => state.Vectors);

  return (
    <Flex
      bg="bg.subtle"
      boxShadow={"md"}
      mt={8}
      borderRadius={"md"}
      direction={"column"}
      w="100%"
    >
      <Heading p={3}>Recent Activity</Heading>
      <Separator />
      <Flex direction="column" w="100%" p={3} gap={3}>
        {latest_log.map(({ log, node }, index) => (
          <VectorLog key={index} vector={node} activity={log} />
        ))}
      </Flex>
      <NavLink to={`/vectors`}>
        <Flex
          borderTop={"1px solid"}
          borderColor={"bg.emphasized"}
          borderBottomRadius={"md"}
          bg="bg.muted"
          p={3}
          align="center"
          justify={"center"}
          transition={"all 0.2s"}
          _hover={{
            cursor: "pointer",
            color: "blue.fg",
          }}
          gap={1}
          color="fg.muted"
        >
          <Text fontSize="sm" fontWeight={500} textTransform={"uppercase"}>
            view all
          </Text>
          <BiRightArrowAlt />
        </Flex>
      </NavLink>
    </Flex>
  );
};

export default RecentActivity;
