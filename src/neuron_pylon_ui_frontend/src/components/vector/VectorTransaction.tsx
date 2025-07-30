import {
  Flex,
  Text,
  Heading,
  Separator,
  Icon,
  Box,
  DialogActionTrigger,
  Button,
  Spacer,
  ClipboardRoot,
} from "@chakra-ui/react";
import {
  BiArrowBack,
  BiArrowToBottom,
  BiCollapse,
  BiLock,
  BiPlusCircle,
  BiReceipt,
} from "react-icons/bi";
import { PiFireBold } from "react-icons/pi";
import { NavLink } from "react-router-dom";
import { act, useState } from "react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChronoChannelShared } from "@/chrono/declarations/chrono_slice/chrono_slice.did";
import {
  extractDataFromChronoRecord,
  extractTransactionTypeFromChronoRecord,
} from "@/utils/ChronoTools";
import {
  convertSecondsToElapsedTime,
  formatSecondsToDateString,
} from "@/utils/Time";
import StatBox from "../stat/StatBox";
import { useTypedSelector } from "@/hooks/useRedux";
import { extractNodeType } from "@/utils/Node";
import { endpointToBalanceAndAccount } from "@/utils/AccountTools";
import { ClipboardIconButton } from "../ui/clipboard";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!meta) return null;

  const { vector_id, chrono_record, vector_account } =
    extractDataFromChronoRecord(transactions);
  const vector = vectors.find((vec) => vec.id === vector_id);

  if (!vector) return null;

  const {
    type,
    symbol: originalSymbol,
    controller,
  } = extractNodeType(vector, meta);

  return (
    <Box>
      {chrono_record.map((record, index) => {
        const { tx_type, other_account, amount } =
          extractTransactionTypeFromChronoRecord(record.value);

        // Determine the correct symbol based on type and source account
        let symbol = originalSymbol;
        if (type === "Mint") {
          if (
            vector_account ===
            endpointToBalanceAndAccount(vector.sources[0]).account
          ) {
            symbol = "ICP";
          }
          // For sources[1], keep the original symbol (which would be "NTC")
        }

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
        // Check if this is a burn transaction (from mint source)
        else if (
          type === "Mint" &&
          vector_account ===
            endpointToBalanceAndAccount(vector.sources[0]).account &&
          tx_type === "Sent"
        ) {
          actualTxType = "Burned";
        }
        // Check if this is a mint transaction (to mint destination)
        else if (
          type === "Mint" &&
          vector_account ===
            endpointToBalanceAndAccount(vector.sources[1]).account &&
          tx_type === "Received"
        ) {
          actualTxType = "Minted";
        }

        const content = (
          <Flex
            direction={"row"}
            align="center"
            transition={"all 0.2s"}
            _hover={{
              cursor: "pointer",
              bg: "bg.muted",
            }}
            onClick={!showLink ? () => setIsDialogOpen(true) : undefined}
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
                ) : actualTxType === "Burned" ? (
                  <Icon
                    fontSize={"20px"}
                    position="absolute"
                    top="-3px"
                    right="-3px"
                    bg={"bg.emphasized"}
                    borderRadius="full"
                    color={"orange.solid"}
                  >
                    <PiFireBold />
                  </Icon>
                ) : actualTxType === "Minted" ? (
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
              color={
                tx_type === "Received"
                  ? "green.solid"
                  : actualTxType === "Burned"
                  ? "orange.solid"
                  : ""
              }
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
              <>
                {content}
                <DialogRoot
                  lazyMount
                  placement={"center"}
                  motionPreset="slide-in-bottom"
                  open={isDialogOpen}
                  onOpenChange={(e) => setIsDialogOpen(e.open)}
                  trapFocus={false}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Transaction Details</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                      <Flex w="100%" gap={3} direction={"column"}>
                        <StatBox
                          title="Vector"
                          value={`${type} #${vector_id}`}
                          bg={"bg.panel"}
                          fontSize="md"
                        />
                        <StatBox
                          title="Transaction Type"
                          value={actualTxType}
                          bg={"bg.panel"}
                          fontSize="md"
                        />
                        <Flex
                          bg="inherit"
                          color={
                            tx_type === "Received"
                              ? "green.solid"
                              : actualTxType === "Burned"
                              ? "orange.solid"
                              : ""
                          }
                        >
                          <StatBox
                            title="Amount"
                            value={`${amount} ${symbol}`}
                            bg={"bg.panel"}
                            fontSize="md"
                          />
                        </Flex>
                        {(actualTxType === "Disbursed" ||
                          actualTxType === "Sent" ||
                          actualTxType === "Received") && (
                          <StatBox
                            title={actualTxType === "Received" ? "From" : "To"}
                            bg={"bg.panel"}
                            fontSize="md"
                          >
                            <Flex align="center" w="100%">
                              <Text truncate fontSize="md" fontWeight={500}>
                                {other_account}
                              </Text>
                              <Spacer />
                              <ClipboardRoot value={other_account}>
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
                        )}
                        <StatBox
                          title="Date"
                          value={formatSecondsToDateString(
                            record.timestamp,
                            true
                          )}
                          bg={"bg.panel"}
                          fontSize="md"
                        />
                      </Flex>
                    </DialogBody>
                    <DialogFooter>
                      <DialogActionTrigger asChild>
                        <Button
                          variant="surface"
                          rounded="md"
                          boxShadow="xs"
                          w="100%"
                        >
                          <BiCollapse /> Done
                        </Button>
                      </DialogActionTrigger>
                    </DialogFooter>
                    <DialogCloseTrigger />
                  </DialogContent>
                </DialogRoot>
              </>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default VectorTransaction;
