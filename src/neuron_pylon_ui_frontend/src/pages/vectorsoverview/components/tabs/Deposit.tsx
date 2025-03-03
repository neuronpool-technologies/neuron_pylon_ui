import { useState } from "react";
import {
  Flex,
  Button,
  Input,
  Image as ChakraImage,
  Icon,
  Text,
} from "@chakra-ui/react";
import { ClipboardIconButton, ClipboardRoot } from "@/components/ui/clipboard";
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
import { toaster } from "@/components/ui/toaster";
import { InputGroup } from "@/components/ui/input-group";
import { Field } from "@/components/ui/field";
import { StatBox, StatRow } from "@/components";
import { BiSend, BiRightArrowAlt, BiDownArrowAlt } from "react-icons/bi";
import { isBalanceOkay } from "@/utils/AccountTools";
import { useActors } from "@/hooks/useActors";
import { transfer } from "@/client/commands";
import { useTypedSelector } from "@/hooks/useRedux";

const Deposit = ({
  vectorId,
  image,
  ledger,
  tokenSymbol,
  tokenFee,
  walletBalance,
  sourceBalance,
  sourceAccount,
  sourceName,
  active,
  children,
}: {
  vectorId: string;
  image: {
    src: string;
    symbol: string;
  };
  ledger: string;
  tokenSymbol: string;
  tokenFee: number;
  walletBalance: number;
  sourceBalance: number;
  sourceAccount: string;
  sourceName: string;
  active: boolean;
  children: React.ReactNode;
}) => {
  const { logged_in, principal } = useTypedSelector((state) => state.Wallet);
  const [amount, setAmount] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [open, setOpen] = useState(false);

  const realFee = tokenFee * 2; // depositing has at least two fees

  const { actors } = useActors();

  const send = async () => {
    setSending(true);

    await transfer({
      pylon: actors.neuronPylon,
      controller: principal,
      ledger: ledger,
      to: sourceAccount,
      amount: amount,
    }).finally(() => {
      setAmount("");
      setSending(false);
      setOpen(false);
    });
  };

  return (
    <Flex
      align="center"
      direction={{ base: "column", md: "row" }}
      w="100%"
      gap={6}
    >
      <Flex direction={"column"} w="100%" gap={3}>
        <Field
          label="From wallet"
          invalid={!isBalanceOkay(walletBalance, Number(amount), realFee)}
          disabled={sending}
        >
          <InputGroup
            w="100%"
            startElement={
              <ChakraImage
                src={image.src}
                alt={image.symbol}
                bg={"bg.emphasized"}
                borderRadius="full"
                h={"20px"}
                w={"20px"}
              />
            }
            endElement={
              <Button
                variant="surface"
                rounded="md"
                boxShadow="xs"
                size="2xs"
                onClick={() => setAmount(walletBalance.toString())}
                disabled={sending || !logged_in}
                colorPalette={"gray"}
              >
                Max
              </Button>
            }
          >
            <Input
              type="number"
              placeholder={`${tokenSymbol} amount`}
              size="lg"
              bg={
                !isBalanceOkay(walletBalance, Number(amount), realFee)
                  ? "bg.error"
                  : ""
              }
              onChange={(e) => setAmount(e.target.value)}
              value={amount}
            />
          </InputGroup>
        </Field>
        <StatRow
          title={"Balance"}
          stat={`${walletBalance.toFixed(4)} ${tokenSymbol}`}
        />
        <StatRow title={"Ledger fee"} stat={`${realFee} ${tokenSymbol}`} />
        <DialogRoot
          lazyMount
          placement={"center"}
          motionPreset="slide-in-bottom"
          open={open}
          onOpenChange={(e) => setOpen(e.open)}
        >
          <DialogTrigger asChild>
            <Button
              disabled={
                !logged_in ||
                !amount ||
                !isBalanceOkay(walletBalance, Number(amount), tokenFee)
              }
              variant="surface"
              colorPalette={"gray"}
              rounded="md"
              boxShadow="xs"
              w="100%"
            >
              <BiSend /> Deposit {tokenSymbol}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deposit {tokenSymbol}</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Flex w="100%" gap={3} direction={"column"}>
                <StatBox
                  title={"Deposit"}
                  bg={"bg"}
                  fontSize="md"
                  value={`${amount} ${tokenSymbol}`}
                />
                <StatRow
                  title={`Vector #${vectorId}`}
                  stat={`${sourceName} source`}
                />
                <StatRow
                  title={"Total fees"}
                  stat={`${realFee} ${tokenSymbol}`}
                />
              </Flex>
            </DialogBody>
            <DialogFooter>
              <Button
                disabled={
                  !logged_in ||
                  !amount ||
                  !isBalanceOkay(walletBalance, Number(amount), tokenFee)
                }
                variant="surface"
                colorPalette={"gray"}
                rounded="md"
                boxShadow="xs"
                w="100%"
                loading={sending}
                onClick={() => {
                  const promise = send();

                  toaster.promise(promise, {
                    success: {
                      title: `${amount} ${tokenSymbol} sent to:`,
                      description: `Vector #${vectorId}`,
                      duration: 3000,
                    },
                    error: {
                      title: "Transaction failed",
                      description: "Please try again.",
                      duration: 3000,
                    },
                    loading: { title: `Sending ${amount} ${tokenSymbol}` },
                  });
                }}
              >
                <BiSend /> Confirm {tokenSymbol} Deposit
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </DialogContent>
        </DialogRoot>
      </Flex>

      <Icon fontSize="40px" hideBelow={"md"}>
        <BiRightArrowAlt />
      </Icon>
      <Icon fontSize="40px" hideFrom={"md"}>
        <BiDownArrowAlt />
      </Icon>

      <Flex direction={"column"} w="100%" gap={3}>
        <StatBox title={`${sourceName} source`} bg={"bg.subtle"} fontSize="md">
          <Text lineClamp={1} fontSize="md" fontWeight={500}>
            {sourceAccount}
          </Text>
          <ClipboardRoot value={sourceAccount}>
            <ClipboardIconButton
              variant="surface"
              colorPalette={"gray"}
              rounded="md"
              boxShadow="xs"
              size="2xs"
            />
          </ClipboardRoot>
        </StatBox>
        <Flex gap={3} align="center">
          <StatBox
            title={active ? "Source balance" : "Source frozen"}
            value={`${sourceBalance.toFixed(4)} ${tokenSymbol}`}
            bg={"bg.subtle"}
            fontSize="md"
            animation={sourceBalance > 0 && active}
          />
          <Icon size="lg">
            <BiRightArrowAlt />
          </Icon>
          {children}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Deposit;
