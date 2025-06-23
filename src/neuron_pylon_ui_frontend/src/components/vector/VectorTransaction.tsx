import {
  Flex,
  Text,
  Heading,
  Separator,
  Icon,
  Box,
  Image as ChakraImage,
} from "@chakra-ui/react";
import { BiReceipt } from "react-icons/bi";
import { NavLink } from "react-router-dom";
import { ChronoChannelShared } from "@/chrono/declarations/chrono_slice/chrono_slice.did";
import {
  extractDataFromChronoRecord,
  extractTransactionTypeFromChronoRecord,
} from "@/utils/ChronoTools";
import { convertSecondsToElapsedTime } from "@/utils/Time";
import StatBox from "../stat/StatBox";
import { useTypedSelector } from "@/hooks/useRedux";
import { tokensIcons } from "@/utils/TokensIcons";
import { extractNodeType } from "@/utils/Node";
import { endpointToBalanceAndAccount } from "@/utils/AccountTools";

// TODO show all channels present to it, but up to a maximum of 6 and also link to the vectorID
// TODO this should also order the chrono records by timestamp too

const VectorTransaction = ({
  transaction,
  first,
  showLink,
}: {
  transaction: [string, ChronoChannelShared];
  first?: boolean;
  showLink?: boolean;
}) => {
  const { vectors } = useTypedSelector((state) => state.Vectors);
  const { meta } = useTypedSelector((state) => state.Meta);
  if (!meta) return null;

  const { vector_id, chrono_record, vector_account } =
    extractDataFromChronoRecord(transaction);

  const vector = vectors.find((vec) => vec.id === vector_id);

  if (!vector) return null;

  const { type, symbol, controller } = extractNodeType(vector, meta);

  const image =
    tokensIcons.find((images) => images.symbol === symbol) || tokensIcons[1]; // default to ICP logo
  return (
    <Box>
      {chrono_record.map((record, index) => {
        const { tx_type, amount } = extractTransactionTypeFromChronoRecord(
          record.value
        );

        const actualTxType =
          type === "Neuron" &&
          vector_account ===
            endpointToBalanceAndAccount(vector.sources[0]).account &&
          tx_type === "Sent"
            ? "Staked"
            : tx_type;
        return (
          <NavLink to={`/vectors/${controller}/${vector.id}`} key={index}>
            {first && index === 0 ? null : <Separator />}
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
                  : { cursor: "default" }
              }
              p={3}
              borderRadius="md"
              bg="bg.subtle"
            >
              <Flex w={{ base: "65%", md: "80%" }} gap={3} align="center">
                <Flex position="relative">
                  <Icon
                    fontSize={45}
                    p={2.5}
                    bg={"bg.emphasized"}
                    borderRadius="full"
                  >
                    <BiReceipt />
                  </Icon>
                  <ChakraImage
                    src={image.src}
                    alt={image.symbol}
                    bg={"bg.emphasized"}
                    borderRadius="full"
                    h={"20px"}
                    w={"20px"}
                    p={0.5}
                    position="absolute"
                    top="-3px"
                    right="-3px"
                  />
                </Flex>
                <Flex direction="column" gap={0}>
                  <Heading fontSize="sm" lineClamp={1} color="blue.fg">
                    Vector #{vector_id}
                  </Heading>
                  <Text fontSize="sm" color="fg.muted" lineClamp={1}>
                    {convertSecondsToElapsedTime(record.timestamp)}
                  </Text>
                </Flex>
              </Flex>
              <Flex
                w={{ base: "40%", md: "25%" }}
                align={"center"}
                bg="inherit"
              >
                <StatBox
                  title={actualTxType}
                  value={`${amount} ${symbol}`}
                  bg="inherit"
                  fontSize="sm"
                />
              </Flex>
            </Flex>
          </NavLink>
        );
      })}
    </Box>
  );
};

export default VectorTransaction;
