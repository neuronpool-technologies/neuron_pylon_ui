import { Flex, Text, Heading, Code } from "@chakra-ui/react";
import { BiCog } from "react-icons/bi";
import {
  NodeShared,
  Activity,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { StatIcon } from "@/components";
import { useTypedSelector } from "@/hooks/useRedux";
import { NavLink } from "react-router-dom";
import { extractActivityType, extractNodeType } from "@/utils/Node";

const VectorLog = ({
  activity,
  vector,
}: {
  activity: Activity;
  vector: NodeShared;
}) => {
  const { meta } = useTypedSelector((state) => state.Meta);
  if (!meta) return null;
  const { type, controller } = extractNodeType(vector, meta);
  const { isError, operation, timestamp, message } =
    extractActivityType(activity);

  return (
    <NavLink to={`/vectors/${controller}/${vector.id}`}>
      <Flex
        boxShadow={"sm"}
        borderRadius={"md"}
        p={3}
        direction={"row"}
        align="center"
        bg="bg.muted"
        transition={"all 0.2s"}
        _hover={{
          cursor: "pointer",
          boxShadow: "md",
          transform: "translateX(5px)",
        }}
      >
        <Flex w={{ base: "65%", md: "80%" }} gap={3} align="center">
          <StatIcon>
            <BiCog />
          </StatIcon>
          <Flex direction="column" gap={0}>
            <Heading fontSize="sm" lineClamp={1} color="blue.fg">
              {type} #{vector.id}
            </Heading>
            <Text fontSize="sm" color="fg.muted" lineClamp={1}>
              {timestamp}
            </Text>
          </Flex>
        </Flex>
        <Flex w={{ base: "35%", md: "20%" }} align="center">
          <Flex direction="column" gap={1}>
            <Code
              size={{ base: "xs", md: "sm" }}
              variant="surface"
              colorPalette={isError ? "red" : "green"}
            >
              {operation}
            </Code>
            {message ? (
              <Code
                size="xs"
                variant="surface"
                colorPalette={"red"}
                lineClamp={3}
              >
                {message}
              </Code>
            ) : null}
          </Flex>
        </Flex>
      </Flex>
    </NavLink>
  );
};

export default VectorLog;
