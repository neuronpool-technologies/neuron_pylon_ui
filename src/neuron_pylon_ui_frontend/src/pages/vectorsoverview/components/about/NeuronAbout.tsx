import {
  Flex,
  Icon,
  Text,
  Spacer,
  Separator,
  Popover,
  IconButton,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { ClipboardIconButton, ClipboardRoot } from "@/components/ui/clipboard";
import { StatBox } from "@/components";
import { BiRightArrowAlt, BiTime } from "react-icons/bi";
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
    undisbursedMaturity,
    disbursingMaturity,
  } = extractNodeType(vector, meta);

  const totalDisbursingMaturity =
    disbursingMaturity?.reduce((acc, item) => acc + item.amount_e8s, 0) || 0;

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
              : Number(totalDisbursingMaturity) > 0
              ? "green.solid"
              : ""
          }
        >
          <StatBox
            title={
              active
                ? `Disbursing ${destinations[0][0]}`
                : `${destinations[0][0]} frozen`
            }
            bg={"bg.subtle"}
          >
            <Flex align="center" w="100%">
              <Text bg={"bg.subtle"} fontSize="md" fontWeight={500}>
                {e8sToIcp(Number(totalDisbursingMaturity)).toFixed(4)} {symbol}
              </Text>
              <Spacer />
              <Popover.Root>
                <Popover.Trigger asChild>
                  <IconButton
                    aria-label="Disbursing maturity list"
                    variant="surface"
                    rounded="md"
                    boxShadow="xs"
                    size="2xs"
                    ms={3}
                    disabled={!active || totalDisbursingMaturity === 0}
                  >
                    <BiTime />
                  </IconButton>
                </Popover.Trigger>
                <Popover.Positioner>
                  <Popover.Content bg="bg">
                    <Popover.CloseTrigger />
                    <Popover.Arrow>
                      <Popover.ArrowTip />
                    </Popover.Arrow>
                    <Popover.Body p={3}>
                      <Popover.Title fontSize="sm" fontWeight={500} color="fg">
                        Time until next disbursement
                        {(disbursingMaturity?.length ?? 0) > 1 ? "s" : ""}
                      </Popover.Title>
                      <Separator my={2} />
                      <Grid templateColumns="repeat(2, 1fr)" gap={1}>
                        {disbursingMaturity?.map((item, index) => (
                          <GridItem key={index}>
                            <StatBox
                              title={
                                active
                                  ? `${item.timeleft}`
                                  : `${destinations[0][0]} frozen`
                              }
                              value={`${e8sToIcp(
                                Number(item.amount_e8s)
                              ).toFixed(4)} ${symbol}`}
                              bg={"bg"}
                              fontSize="md"
                            />
                          </GridItem>
                        ))}
                      </Grid>
                    </Popover.Body>
                  </Popover.Content>
                </Popover.Positioner>
              </Popover.Root>
            </Flex>
          </StatBox>
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
          title={"Available maturity"}
          value={`${undisbursedMaturity} ${symbol}`}
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
