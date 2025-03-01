import { Flex, Text, Heading, Image as ChakraImage } from "@chakra-ui/react";
import { NodeShared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { StatBox } from "@/components";
import { useTypedSelector } from "@/hooks/useRedux";
import { NavLink } from "react-router-dom";
import { extractNodeType } from "@/utils/Node";
import { tokensIcons } from "@/utils/TokensIcons";

const VectorPreview = ({ vector }: { vector: NodeShared }) => {
  const { meta } = useTypedSelector((state) => state.Meta);
  if (!meta) return null;
  const { type, label, symbol, value, created, controller } = extractNodeType(
    vector,
    meta
  );
  const image =
    tokensIcons.find((images) => images.symbol === symbol) || tokensIcons[1]; // default to ICP logo

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
          <ChakraImage
            src={image.src}
            alt={image.symbol}
            bg={"bg.emphasized"}
            borderRadius="full"
            p={2.5}
            h={45}
            w={45}
          />
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
