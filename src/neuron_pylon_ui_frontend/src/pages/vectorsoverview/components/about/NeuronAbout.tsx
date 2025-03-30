import { Flex, Icon, Text, Spacer, Separator } from "@chakra-ui/react";
import { ClipboardIconButton, ClipboardRoot } from "@/components/ui/clipboard";
import { StatBox } from "@/components";
import { BiRightArrowAlt } from "react-icons/bi";
import {
  NodeShared,
  PylonMetaResp,
} from "@/declarations/neuron_pylon/neuron_pylon.did";
import { extractNodeType } from "@/utils/Node";
import { e8sToIcp } from "@/utils/TokenTools";

const NeuronAbout = ({
  vector,
  meta,
}: {
  vector: NodeShared;
  meta: PylonMetaResp;
}) => {
  const {
    destinations,
    active,
    symbol,
    neuronId,
    neuronFollowee,
    dissolveDelay,
    neuronStatus,
    lastUpdated,
    unspawnedMaturity,
    spawningMaturity,
  } = extractNodeType(vector, meta);

  return (
    <Flex direction={"column"} w="100%" gap={3} p={3} h="100%">
      <StatBox title={"Neuron ID"} bg={"bg.subtle"}>
        <Flex w="100%" align="center">
          <Text lineClamp={1} fontSize="md" fontWeight={500}>
            {neuronId?.slice(0, 60)}
            {(neuronId?.length ?? 0) > 60 ? "..." : ""}
          </Text>
          <Spacer />
          <ClipboardRoot value={neuronId}>
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
      <Flex gap={3} align="center" direction={{ base: "column", md: "row" }}>
        <Flex
          w={{ base: "100%", md: "50%" }}
          color={
            !active
              ? "red.solid"
              : Number(spawningMaturity) > 0
              ? "green.solid"
              : ""
          }
        >
          <StatBox
            title={
              active
                ? `Spawning ${destinations[0][0]}`
                : `${destinations[0][0]} frozen`
            }
            value={`${e8sToIcp(Number(spawningMaturity)).toFixed(4)} ${symbol}`}
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
            <Text truncate fontSize="md" fontWeight={500}>
              {destinations[0][1].slice(0, 50)}
            </Text>
            <ClipboardRoot value={destinations[0][1]}>
              <ClipboardIconButton
                variant="surface"
                rounded="md"
                boxShadow="xs"
                size="2xs"
                ms={3}
              />
            </ClipboardRoot>
          </StatBox>
        </Flex>
      </Flex>
      <Spacer />
      <Separator />
      <Spacer />
      <StatBox
        title={"Followee"}
        value={neuronFollowee}
        bg={"bg.subtle"}
        fontSize="md"
      />
      <Flex gap={3} align="center" direction={"row"}>
        <StatBox
          title={"Dissolve delay"}
          value={dissolveDelay}
          bg={"bg.subtle"}
          fontSize="md"
        />
        <StatBox
          title={"Neuron status"}
          value={neuronStatus}
          bg={"bg.subtle"}
          fontSize="md"
        />
      </Flex>
      <Flex gap={3} align="center" direction={"row"}>
        <StatBox
          title={"Unspawned maturity"}
          value={`${unspawnedMaturity} ${symbol}`}
          bg={"bg.subtle"}
          fontSize="md"
        />
        <StatBox
          title={"Last updated"}
          value={lastUpdated}
          bg={"bg.subtle"}
          fontSize="md"
        />
      </Flex>
    </Flex>
  );
};

export default NeuronAbout;
