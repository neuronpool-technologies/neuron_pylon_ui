import { Flex, Icon, Text, Spacer, Separator } from "@chakra-ui/react";
import { ClipboardIconButton, ClipboardRoot } from "@/components/ui/clipboard";
import { StatBox } from "@/components";
import { BiRightArrowAlt } from "react-icons/bi";
import {
  NodeShared,
  PylonMetaResp,
} from "@/declarations/neuron_pylon/neuron_pylon.did";
import { extractNodeType } from "@/utils/Node";

const MintAbout = ({
  vector,
  meta,
}: {
  vector: NodeShared;
  meta: PylonMetaResp;
}) => {
  const { destinations, mintStatus, lastUpdated } = extractNodeType(
    vector,
    meta
  );

  return (
    <Flex direction={"column"} w="100%" gap={3} p={3} h="100%">
      <Flex gap={3} align="center" direction={{ base: "column", md: "row" }}>
        <Flex w={{ base: "100%", md: "50%" }}>
          <StatBox
            title={"Mint status"}
            value={mintStatus}
            bg={"bg.subtle"}
            fontSize="md"
          />
        </Flex>
        <Icon size="lg" hideBelow={"md"}>
          <BiRightArrowAlt />
        </Icon>
        <Icon size="lg" hideFrom={"md"} transform="rotate(90deg)">
          <BiRightArrowAlt />
        </Icon>
        <Flex w={{ base: "100%", md: "50%" }}>
          <StatBox title={`${destinations[0][0]} destination`} bg={"bg.subtle"}>
            <Flex align="center" w="100%">
              <Text truncate fontSize="md" fontWeight={500}>
                {destinations[0][1].slice(0, 50)}
              </Text>
              <Spacer />
              <ClipboardRoot value={destinations[0][1]}>
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
        </Flex>
      </Flex>
      <Separator />
      <StatBox
        title={"Last updated"}
        value={lastUpdated}
        bg={"bg.subtle"}
        fontSize="md"
      />
    </Flex>
  );
};

export default MintAbout;
