import { useTypedSelector } from "@/hooks/useRedux";
import { Flex, Heading, Separator, Text } from "@chakra-ui/react";
import { VectorLog } from "@/components";
import { BiRightArrowAlt } from "react-icons/bi";
import { NavLink } from "react-router-dom";
import { extractAllLogs } from "@/utils/Node";
import {
  Activity,
  NodeShared,
} from "@/declarations/neuron_pylon/neuron_pylon.did";

const RecentActivity = () => {
  const { vectors } = useTypedSelector((state) => state.Vectors);

  const latest_log: Array<{ log: Activity; node: NodeShared }> = vectors
    .flatMap((node) => {
      if (!node) return [];
      // For each log in the node, return an object containing both the log and the node
      return extractAllLogs(node).map((log) => ({
        log,
        node: node as NodeShared,
      }));
    })
    // Sort by timestamp in descending order (most recent first)
    .sort((a, b) => {
      const timestampA =
        "Ok" in a.log
          ? Number(a.log.Ok.timestamp)
          : Number(a.log.Err.timestamp);
      const timestampB =
        "Ok" in b.log
          ? Number(b.log.Ok.timestamp)
          : Number(b.log.Err.timestamp);
      return timestampB - timestampA; // Higher timestamps (more recent) come first
    })
    // Take only the 6 most recent logs
    .slice(0, 6);

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
      <Flex direction="column" w="100%">
        {latest_log.map(({ log, node }, index) => (
          <VectorLog
            key={index}
            vector={node}
            activity={log}
            first={index === 0}
            showLink
          />
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
            view vectors
          </Text>
          <BiRightArrowAlt />
        </Flex>
      </NavLink>
    </Flex>
  );
};

export default RecentActivity;
