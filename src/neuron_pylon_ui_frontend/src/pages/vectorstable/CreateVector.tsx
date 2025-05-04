import {
  Button,
  Flex,
  Text,
  RadioCard,
  Image as ChakraImage,
  Icon,
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

    const commonCreateRequest: CommonCreateRequest = {
      controllers: [vectorOwner],
      destinations: [[{ ic: walletAccount }], [{ ic: walletAccount }]],
      refund: walletAccount,
      ledgers: [ledgerFound.ledger],
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
          disabled={true}
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
                {meta.modules.map((module, index) => (
                  <RadioCard.Item
                    value={module.name}
                    key={index}
                    _hover={{ cursor: "pointer", bg: "bg.muted" }}
                  >
                    <RadioCard.ItemHiddenInput />
                    <RadioCard.ItemControl>
                      <Flex align="center" gap={3}>
                        {module.name !== "Split" ? (
                          <ChakraImage
                            src={
                              module.name === "ICP Neuron"
                                ? tokensIcons[1].src
                                : tokensIcons[0].src
                            }
                            alt={
                              module.name === "ICP Neuron"
                                ? tokensIcons[1].symbol
                                : tokensIcons[0].symbol
                            }
                            bg={"bg.emphasized"}
                            borderRadius="full"
                            p={2.5}
                            h={45}
                            w={45}
                          />
                        ) : (
                          <Icon
                            h={45}
                            w={45}
                            p={2.5}
                            bg={"bg.emphasized"}
                            borderRadius="full"
                          >
                            <TbArrowsSplit2 />
                          </Icon>
                        )}
                        <RadioCard.ItemContent>
                          <RadioCard.ItemText>{module.name}</RadioCard.ItemText>
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
              {vectorToCreate !== "ICP Neuron" ? (
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
                        item.symbol === "ICP" &&
                        vectorToCreate === "SNS Neuron"
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
                    : "None"
                }
              />
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
