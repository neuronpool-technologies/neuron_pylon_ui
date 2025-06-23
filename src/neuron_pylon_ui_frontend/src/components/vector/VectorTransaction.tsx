import { Flex, Text, Heading, Separator, Icon, Box } from "@chakra-ui/react";
import {
  BiArrowBack,
  BiArrowToBottom,
  BiLock,
  BiPlusCircle,
  BiReceipt,
} from "react-icons/bi";
import { NavLink } from "react-router-dom";
import { ChronoChannelShared } from "@/chrono/declarations/chrono_slice/chrono_slice.did";
import {
  extractDataFromChronoRecord,
  extractTransactionTypeFromChronoRecord,
} from "@/utils/ChronoTools";
import { convertSecondsToElapsedTime } from "@/utils/Time";
import StatBox from "../stat/StatBox";
import { useTypedSelector } from "@/hooks/useRedux";
import { extractNodeType } from "@/utils/Node";
import { endpointToBalanceAndAccount } from "@/utils/AccountTools";

const VectorTransaction = ({
  transactions,
  first,
  showLink,
}: {
  transactions: [string, ChronoChannelShared];
  first?: boolean;
  showLink?: boolean;
}) => {
  const { vectors } = useTypedSelector((state) => state.Vectors);
  const { meta } = useTypedSelector((state) => state.Meta);
  if (!meta) return null;

  const { vector_id, chrono_record, vector_account } =
    extractDataFromChronoRecord(transactions);
  const vector = vectors.find((vec) => vec.id === vector_id);

  if (!vector) return null;

  const { type, symbol, controller } = extractNodeType(vector, meta);

  return (
    <Box>
      {chrono_record.map((record, index) => {
        const { tx_type, amount } = extractTransactionTypeFromChronoRecord(
          record.value
        );

        let actualTxType = tx_type;

        // Check if this is a staking transaction (from neuron source)
        if (
          type === "Neuron" &&
          vector_account ===
            endpointToBalanceAndAccount(vector.sources[0]).account &&
          tx_type === "Sent"
        ) {
          actualTxType = "Staked";
        }
        // Check if this is a disbursement transaction (from maturity source)
        else if (
          type === "Neuron" &&
          vector_account ===
            endpointToBalanceAndAccount(vector.sources[1]).account &&
          tx_type === "Sent"
        ) {
          actualTxType = "Disbursed";
        } else if (
          type === "Neuron" &&
          vector_account ===
            endpointToBalanceAndAccount(vector.sources[1]).account &&
          tx_type === "Received"
        ) {
          actualTxType = "Spawned";
        }

        const content = (
          <Flex
            direction={"row"}
            align="center"
            transition={"all 0.2s"}
            _hover={
              showLink
                ? {
                    cursor: "pointer",
                    bg: "bg.muted",
                  }
                : {}
            }
            p={3}
            borderRadius="md"
            bg="bg.subtle"
          >
            <Flex w={{ base: "55%", md: "80%" }} gap={3} align="center">
              <Flex position="relative">
                <Icon
                  fontSize={45}
                  p={2.5}
                  bg={"bg.emphasized"}
                  borderRadius="full"
                >
                  <BiReceipt />
                </Icon>
                {actualTxType === "Staked" ? (
                  <Icon
                    fontSize={"20px"}
                    position="absolute"
                    top="-3px"
                    right="-3px"
                    bg={"bg.emphasized"}
                    borderRadius="full"
                  >
                    <BiLock />
                  </Icon>
                ) : actualTxType === "Received" ? (
                  <Icon
                    fontSize={"20px"}
                    position="absolute"
                    top="-3px"
                    right="-3px"
                    bg={"bg.emphasized"}
                    borderRadius="full"
                    color={"green.solid"}
                  >
                    <BiArrowToBottom />
                  </Icon>
                ) : actualTxType === "Spawned" ? (
                  <Icon
                    fontSize={"20px"}
                    position="absolute"
                    top="-3px"
                    right="-3px"
                    bg={"bg.emphasized"}
                    borderRadius="full"
                    color={"green.solid"}
                  >
                    <BiPlusCircle />
                  </Icon>
                ) : (
                  <Icon
                    fontSize={"20px"}
                    position="absolute"
                    top="-3px"
                    right="-3px"
                    bg={"bg.emphasized"}
                    borderRadius="full"
                    transform={"rotate(135deg)"}
                  >
                    <BiArrowBack />
                  </Icon>
                )}
              </Flex>
              <Flex direction="column" gap={0}>
                <Heading fontSize="sm" lineClamp={1} color="blue.fg">
                  {type} #{vector_id}
                </Heading>
                <Text fontSize="sm" color="fg.muted" lineClamp={1}>
                  {convertSecondsToElapsedTime(record.timestamp)}
                </Text>
              </Flex>
            </Flex>
            <Flex
              w={{ base: "45%", md: "25%" }}
              align={"center"}
              bg="inherit"
              color={tx_type === "Received" ? "green.solid" : ""}
            >
              <StatBox
                title={actualTxType}
                value={`${amount} ${symbol}`}
                bg="inherit"
                fontSize="sm"
              />
            </Flex>
          </Flex>
        );

        return (
          <Box key={index}>
            {first && index === 0 ? null : <Separator />}
            {showLink ? (
              <NavLink to={`/vectors/${controller}/${vector.id}`}>
                {content}
              </NavLink>
            ) : (
              content
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default VectorTransaction;
