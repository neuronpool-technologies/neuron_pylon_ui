import {
  Flex,
  Text,
  Heading,
  Image as ChakraImage,
  Separator,
  Icon,
} from "@chakra-ui/react";
import { TiBatteryFull, TiBatteryLow } from "react-icons/ti";
import { NodeShared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { StatBox } from "@/components";
import { useTypedSelector } from "@/hooks/useRedux";
import { NavLink, useParams } from "react-router-dom";
import { extractNodeType } from "@/utils/Node";
import { tokensIcons } from "@/utils/TokensIcons";

const VectorPreview = ({
  first,
  vector,
}: {
  first: boolean;
  vector: NodeShared;
}) => {
  const { meta } = useTypedSelector((state) => state.Meta);
  const params = useParams();

  if (!meta) return null;
  const { type, label, symbol, value, created, controller, active } =
    extractNodeType(vector, meta);
  const image =
    tokensIcons.find((images) => images.symbol === symbol) || tokensIcons[1]; // default to ICP logo

  return (
    <NavLink
      to={`/vectors/${controller}/${vector.id}`}
      state={{ from: params.controller }}
    >
      {!first ? <Separator /> : null}
      <Flex
        direction={"row"}
        align="center"
        transition={"all 0.2s"}
        _hover={{
          cursor: "pointer",
          bg: "bg.muted",
        }}
        p={3}
        bg="bg.subtle"
        borderRadius="md"
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
            <Heading
              fontSize="sm"
              lineClamp={1}
              color="blue.fg"
              display="inline-flex"
              alignItems="center"
            >
              {type} #{vector.id}{" "}
              <Icon
                color={active ? "green.solid" : "red.solid"}
                transform="rotate(-90deg)"
              >
                {active ? <TiBatteryFull /> : <TiBatteryLow />}
              </Icon>
            </Heading>
            <Text fontSize="sm" color="fg.muted" lineClamp={1}>
              {created}
            </Text>
          </Flex>
        </Flex>
        <Flex w={{ base: "35%", md: "20%" }} align={"center"} bg="inherit">
          <StatBox title={label} value={value} bg="inherit" fontSize="sm" />
        </Flex>
      </Flex>
    </NavLink>
  );
};

export default VectorPreview;
