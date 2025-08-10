import {
  Button,
  Flex,
  Text,
  RadioCard,
  Image as ChakraImage,
  Icon,
  Alert,
} from "@chakra-ui/react";
import { TbArrowsSplit2 } from "react-icons/tb";
import { BiPlus } from "react-icons/bi";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { StatBox, StatRow } from "@/components";
import {
  PylonMetaResp,
  AccountEndpoint,
  CommonCreateRequest,
  CreateRequest,
  InputAddress,
} from "@/declarations/neuron_pylon/neuron_pylon.did";
import { e8sToIcp } from "@/utils/TokenTools";
import { tokensIcons } from "@/utils/TokensIcons";
import {
  endpointToBalanceAndAccount,
  stringToIcrcAccount,
} from "@/utils/AccountTools";
import { toaster } from "@/components/ui/toaster";
import { useNavigate } from "react-router-dom";
import { create } from "@/client/commands";
import { hexStringToUint8Array } from "@dfinity/utils";
import { ActorSubclass } from "@dfinity/agent";

const CreateVector = ({
  loggedIn,
  principal,
  pylonAccount,
  meta,
  actors,
}: {
  loggedIn: boolean;
  principal: string;
  pylonAccount: AccountEndpoint[];
  meta: PylonMetaResp | null;
  actors: Record<string, ActorSubclass>;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [vectorToCreate, setVectorToCreate] = useState<string>("");
  const [ledgerToUse, setLedgerToUse] = useState<string>("");
  const navigate = useNavigate();

  if (!meta)
    return (
      <Button
        variant={"subtle"}
        colorPalette="blue"
        rounded="0"
        size="sm"
        disabled={!loggedIn}
      >
        <BiPlus />
        <Text hideBelow={"md"}>Create Vector</Text>
        <Text hideFrom={"md"}>Create</Text>
      </Button>
    );

  const billingTokenInfo = meta?.supported_ledgers.find((ledger) => {
    if (!("ic" in ledger?.ledger)) return false;
    return ledger?.ledger.ic.toString() === meta.billing.ledger.toString();
  });

  if (!billingTokenInfo) return null;

  const w = pylonAccount?.find((w) => {
    const walletLedger = endpointToBalanceAndAccount(w).ledger;
    return walletLedger === meta.billing.ledger.toString();
  });

  const walletBalance = w ? endpointToBalanceAndAccount(w).balance : 0;

  const createFee = e8sToIcp(Number(meta.billing.min_create_balance)).toFixed(
    4
  );

  const createVector = async () => {
    setCreating(true);

    const ledgerFound =
      vectorToCreate === "ICP Neuron"
        ? meta.supported_ledgers.find((ledger) => ledger.symbol === "ICP")
        : vectorToCreate === "Mint NTC"
        ? meta.supported_ledgers.find((ledger) => ledger.symbol === "NTC")
        : vectorToCreate === "Redeem NTC"
        ? meta.supported_ledgers.find((ledger) => ledger.symbol === "NTC")
        : meta.supported_ledgers.find(
            (ledger) => ledger.symbol === ledgerToUse
          );

    if (!ledgerFound) {
      throw new Error("Ledger not found");
    }

    const vectorOwner = stringToIcrcAccount(principal);

    if (!w) {
      throw new Error("Wallet account not found");
    }
    const walletAccount = stringToIcrcAccount(
      endpointToBalanceAndAccount(w).account
    );

    // For Mint NTC, we need ICP ledger first and NTC ledger second
    const ledgers =
      vectorToCreate === "Mint NTC"
        ? [
            meta.supported_ledgers.find((ledger) => ledger.symbol === "ICP")
              ?.ledger || ledgerFound.ledger,
            ledgerFound.ledger,
          ]
        : [ledgerFound.ledger];

    const destinations: [InputAddress][] =
      vectorToCreate === "Mint NTC"
        ? [[{ ic: walletAccount }]]
        : vectorToCreate === "Redeem NTC"
        ? [
            [{ ic: { owner: walletAccount.owner, subaccount: [] } }],
            [{ ic: { owner: walletAccount.owner, subaccount: [] } }],
          ]
        : [[{ ic: walletAccount }], [{ ic: walletAccount }]];

    const commonCreateRequest: CommonCreateRequest = {
      controllers: [vectorOwner],
      destinations: destinations,
      refund: walletAccount,
      ledgers: ledgers,
      sources: [],
      extractors: [],
      affiliate: process.env.REACT_APP_AFFILIATE
        ? [stringToIcrcAccount(process.env.REACT_APP_AFFILIATE)]
        : [],
      temporary: false,
      billing_option: 0n,
      initial_billing_amount: [],
      temp_id: 0,
    };

    const createRequest: CreateRequest =
      vectorToCreate === "ICP Neuron"
        ? {
            devefi_jes1_icpneuron: {
              variables: {
                dissolve_delay: { Default: null },
                dissolve_status: { Locked: null },
                followee: { Default: null },
              },
            },
          }
        : vectorToCreate === "SNS Neuron"
        ? {
            devefi_jes1_snsneuron: {
              variables: {
                dissolve_delay: { Default: null },
                dissolve_status: { Locked: null },
                followee:
                  ledgerFound.symbol === "NTN" &&
                  process.env.REACT_APP_DEFAULT_NTN_FOLLOWEE
                    ? {
                        FolloweeId: hexStringToUint8Array(
                          process.env.REACT_APP_DEFAULT_NTN_FOLLOWEE
                        ),
                      }
                    : { Unspecified: null },
              },
            },
          }
        : vectorToCreate === "Mint NTC"
        ? {
            devefi_jes1_ntc_mint: {},
          }
        : vectorToCreate === "Redeem NTC"
        ? {
            devefi_jes1_ntc_redeem: {
              variables: {
                split: [50n, 50n],
                names: ["Canister 1", "Canister 2"],
              },
            },
          }
        : {
            devefi_split: {
              variables: {
                split: [50n, 50n],
              },
            },
          };

    const id = await create({
      pylon: actors.neuronPylon,
      controller: principal,
      createReq: [commonCreateRequest, createRequest],
    }).finally(() => {
      setCreating(false);
      setOpen(false);
      setVectorToCreate("");
    });

    navigate(`/vectors/${principal}/${id}/modify`);
  };

  const confirm = async () => {
    const promise = createVector();

    toaster.promise(promise, {
      success: {
        title: `${vectorToCreate} vector created`,
        duration: 3000,
      },
      error: (error) => ({
        title: "Creation failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        duration: 3000,
      }),
      loading: { title: `Creating ${vectorToCreate} vector` },
      finally: () => {
        setOpen(false);
        setCreating(false);
        setVectorToCreate("");
        setLedgerToUse("");
      },
    });
  };

  return (
    <DialogRoot
      lazyMount
      placement={"center"}
      motionPreset="slide-in-bottom"
      open={open}
      onOpenChange={(e) => {
        setOpen(e.open);
        setVectorToCreate("");
        setLedgerToUse("");
      }}
      trapFocus={false}
    >
      <DialogTrigger asChild>
        <Button
          variant={"subtle"}
          colorPalette="blue"
          rounded="0"
          size="sm"
          disabled={!loggedIn}
        >
          <BiPlus />
          <Text hideBelow={"md"}>Create Vector</Text>
          <Text hideFrom={"md"}>Create</Text>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Vector</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {vectorToCreate === "" ? (
            <RadioCard.Root
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setVectorToCreate(event.target.value)
              }
            >
              <RadioCard.Label mb={1}>
                Select a module to create a vector
              </RadioCard.Label>
              <Flex direction={"column"} gap={3}>
                {meta.modules
                  .slice()
                  .sort((a, b) => {
                    const order = [
                      "ICP Neuron",
                      "SNS Neuron",
                      "Mint NTC",
                      "Redeem NTC",
                      "Split",
                    ];
                    return order.indexOf(a.name) - order.indexOf(b.name);
                  })
                  .map((module, index) => (
                    <RadioCard.Item
                      value={module.name}
                      key={index}
                      _hover={{ cursor: "pointer", bg: "bg.muted" }}
                    >
                      <RadioCard.ItemHiddenInput />
                      <RadioCard.ItemControl>
                        <Flex align="center" gap={3}>
                          {module.name === "Split" ? (
                            <Flex position="relative">
                              <Icon
                                fontSize={45}
                                p={2.5}
                                bg={"bg.emphasized"}
                                borderRadius="full"
                              >
                                <TbArrowsSplit2 />
                              </Icon>
                              <ChakraImage
                                src={tokensIcons[1].src}
                                alt={tokensIcons[1].symbol}
                                bg={"bg.emphasized"}
                                borderRadius="full"
                                h={"18px"}
                                w={"18px"}
                                position="absolute"
                                top="-3px"
                                right="-3px"
                              />
                            </Flex>
                          ) : null}
                          {module.name === "ICP Neuron" ? (
                            <ChakraImage
                              src={tokensIcons[1].src}
                              alt={tokensIcons[1].symbol}
                              bg={"bg.emphasized"}
                              borderRadius="full"
                              h={45}
                              w={45}
                            />
                          ) : null}
                          {module.name === "SNS Neuron" ? (
                            <ChakraImage
                              src={tokensIcons[0].src}
                              alt={tokensIcons[0].symbol}
                              bg={"bg.emphasized"}
                              borderRadius="full"
                              h={45}
                              w={45}
                            />
                          ) : null}
                          {module.name === "Mint NTC" ? (
                            <ChakraImage
                              src={tokensIcons[4].src}
                              alt={tokensIcons[4].symbol}
                              bg={"bg.emphasized"}
                              borderRadius="full"
                              h={45}
                              w={45}
                            />
                          ) : null}
                          {module.name === "Redeem NTC" ? (
                            <Flex position="relative">
                              <Icon
                                fontSize={45}
                                p={2.5}
                                bg={"bg.emphasized"}
                                borderRadius="full"
                              >
                                <TbArrowsSplit2 />
                              </Icon>
                              <ChakraImage
                                src={tokensIcons[4].src}
                                alt={tokensIcons[4].symbol}
                                bg={"bg.emphasized"}
                                borderRadius="full"
                                h={"18px"}
                                w={"18px"}
                                position="absolute"
                                top="-3px"
                                right="-3px"
                              />
                            </Flex>
                          ) : null}
                          <RadioCard.ItemContent>
                            <RadioCard.ItemText>
                              {module.name}
                            </RadioCard.ItemText>
                            <RadioCard.ItemDescription>
                              {module.description}
                            </RadioCard.ItemDescription>
                          </RadioCard.ItemContent>
                        </Flex>
                      </RadioCard.ItemControl>
                    </RadioCard.Item>
                  ))}
              </Flex>
            </RadioCard.Root>
          ) : (
            <Flex w="100%" gap={3} direction={"column"}>
              <StatBox
                title={"Vector Type"}
                bg={"bg.panel"}
                fontSize="md"
                value={vectorToCreate}
              />
              {vectorToCreate !== "ICP Neuron" &&
              vectorToCreate !== "Mint NTC" &&
              vectorToCreate !== "Redeem NTC" ? (
                <RadioCard.Root
                  orientation="horizontal"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setLedgerToUse(event.target.value)
                  }
                >
                  <RadioCard.Label>
                    Choose {vectorToCreate} Type
                  </RadioCard.Label>
                  <Flex direction={"column"} gap={3}>
                    {meta.supported_ledgers.map((item, index) => {
                      if (
                        item.symbol === "ICP" ||
                        (item.symbol === "NTC" &&
                          vectorToCreate === "SNS Neuron")
                      )
                        return null;
                      return (
                        <RadioCard.Item
                          value={item.symbol}
                          key={index}
                          _hover={{ cursor: "pointer", bg: "bg.muted" }}
                        >
                          <RadioCard.ItemHiddenInput />
                          <RadioCard.ItemControl>
                            <ChakraImage
                              src={
                                tokensIcons.find(
                                  (icon) => icon.symbol === item.symbol
                                )?.src || ""
                              }
                              alt={item.symbol}
                              bg={"bg.emphasized"}
                              borderRadius="full"
                              h={"20px"}
                              w={"20px"}
                            />
                            <RadioCard.ItemText>{item.name}</RadioCard.ItemText>
                          </RadioCard.ItemControl>
                        </RadioCard.Item>
                      );
                    })}
                  </Flex>
                </RadioCard.Root>
              ) : null}
              <StatRow
                title={"Balance"}
                stat={`${walletBalance.toFixed(4)} ${billingTokenInfo.symbol}`}
              />
              <StatRow
                title={"Create fee"}
                stat={`${createFee} ${billingTokenInfo.symbol}`}
              />
              <StatRow
                title={"Vector billing"}
                stat={
                  vectorToCreate === "SNS Neuron"
                    ? "0.05 NTN per day"
                    : vectorToCreate === "ICP Neuron"
                    ? "5% of Maturity"
                    : vectorToCreate === "Split"
                    ? "5x Ledger fee"
                    : vectorToCreate === "Mint NTC"
                    ? "0.1 NTC per mint"
                    : vectorToCreate === "Redeem NTC"
                    ? "None"
                    : "None"
                }
              />
              {Number(createFee) > walletBalance ? (
                <Alert.Root variant={"outline"} status="warning">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Description>
                      Insufficient balance. You need at least {createFee}{" "}
                      {billingTokenInfo.symbol} for the creation fee.
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              ) : null}
            </Flex>
          )}
        </DialogBody>
        {vectorToCreate !== "" ? (
          <DialogFooter>
            <Button
              variant="surface"
              colorPalette={"blue"}
              rounded="md"
              boxShadow="xs"
              w="100%"
              disabled={
                Number(createFee) > walletBalance ||
                (vectorToCreate === "SNS Neuron" && ledgerToUse === "") ||
                (vectorToCreate === "Split" && ledgerToUse === "")
              }
              onClick={confirm}
              loading={creating}
            >
              <BiPlus />
              Create Vector
            </Button>
          </DialogFooter>
        ) : null}
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default CreateVector;
