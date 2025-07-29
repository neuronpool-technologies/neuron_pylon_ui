import { Flex, Spacer, Text, Icon } from "@chakra-ui/react";
import { ClipboardIconButton, ClipboardRoot } from "@/components/ui/clipboard";
import {
  NodeShared,
  PylonMetaResp,
} from "@/declarations/neuron_pylon/neuron_pylon.did";
import { TbArrowsSplit2 } from "react-icons/tb";
import { StatBox } from "@/components";
import { extractNodeType } from "@/utils/Node";

const RedeemAbout = ({
  vector,
  meta,
}: {
  vector: NodeShared;
  meta: PylonMetaResp;
}) => {
  const { destinations, active, label, name, splits } = extractNodeType(
    vector,
    meta
  );
  return (
    <Flex
      align="center"
      direction={{ base: "column", md: "row" }}
      w="100%"
      gap={6}
      p={3}
    >
      <Flex w="100%" maxW={{ base: "100%", md: "50%" }}>
        <StatBox
          title={active ? label : `${label} frozen`}
          value={`${name}`}
          bg={"bg.subtle"}
          fontSize="md"
        />
      </Flex>
      <Icon fontSize="40px" hideBelow={"md"}>
        <TbArrowsSplit2 />
      </Icon>
      <Icon fontSize="40px" hideFrom={"md"} transform="rotate(90deg)">
        <TbArrowsSplit2 />
      </Icon>
      <Flex direction="column" gap={3} w={{ base: "100%", md: "50%" }}>
        {destinations.map((d, index) => (
          <StatBox
            key={index}
            title={`Sending ${splits ? splits[index] : 0}% to ${d[0]}`}
            bg={"bg.subtle"}
          >
            <Flex w="100%" align="center">
              <Text truncate fontSize="md" fontWeight={500}>
                {d[1]}
              </Text>
              <Spacer />
              <ClipboardRoot value={d[1]}>
                <ClipboardIconButton
                  variant="surface"
                  rounded="md"
                  boxShadow="xs"
                  size="2xs"
                  ms={3}
                />
              </ClipboardRoot>
            </Flex>
          </StatBox>
        ))}
      </Flex>
    </Flex>
  );
};

export default RedeemAbout;
