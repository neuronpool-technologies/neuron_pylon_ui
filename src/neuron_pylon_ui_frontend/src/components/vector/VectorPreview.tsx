import { Flex, Text, Heading } from "@chakra-ui/react";
import { BiRefresh } from "react-icons/bi";
import { NodeShared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { StatBox, StatIcon } from "@/components";
import { useTypedSelector } from "@/hooks/useRedux";
import { NavLink } from "react-router-dom";
import { extractNodeType } from "@/utils/Node";

const VectorPreview = ({ vector }: { vector: NodeShared }) => {
  const { meta } = useTypedSelector((state) => state.Meta);
  if (!meta) return null;
  const { type, label, value, created, controller } = extractNodeType(
    vector,
    meta
  );

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
            <BiRefresh />
          </StatIcon>
          <Flex direction="column" gap={0}>
            <Heading fontSize="sm" lineClamp={1} color="blue.fg">
              {type} #{vector.id}
            </Heading>
            <Text fontSize="sm" color="fg.muted" lineClamp={1}>
              {created}
            </Text>
          </Flex>
        </Flex>
        <Flex w={{ base: "35%", md: "20%" }} align={"center"}>
          <StatBox title={label} value={value} />
        </Flex>
      </Flex>
    </NavLink>
  );
};

export default VectorPreview;
