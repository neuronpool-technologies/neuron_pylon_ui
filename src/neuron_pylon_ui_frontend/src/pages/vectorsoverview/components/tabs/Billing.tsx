import { useState } from "react";
import {
  Flex,
  Button,
  Input,
  Image as ChakraImage,
  Icon,
  Text,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { ClipboardIconButton, ClipboardRoot } from "@/components/ui/clipboard";
import { InputGroup } from "@/components/ui/input-group";
import { Field } from "@/components/ui/field";
import { ConfirmDialog, StatBox, StatRow } from "@/components";
import { BiSend, BiRightArrowAlt, BiDownArrowAlt } from "react-icons/bi";
import {
  endpointToBalanceAndAccount,
  isBalanceOkay,
} from "@/utils/AccountTools";
import { useActors } from "@/hooks/useActors";
import { transfer } from "@/client/commands";
import { useTypedSelector } from "@/hooks/useRedux";

const Billing = ({
  vectorId,
  image,
  ledger,
  tokenSymbol,
  tokenFee,
  billingBalance,
  billingAccount,
  billingOption,
}: {
  vectorId: string;
  image: {
    src: string;
    symbol: string;
  };
  ledger: string;
  tokenSymbol: string;
  tokenFee: number;
  billingBalance: number;
  billingAccount: string;
  billingOption: string;
}) => {
  const { logged_in, principal, pylon_account } = useTypedSelector(
    (state) => state.Wallet
  );
  const [amount, setAmount] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [open, setOpen] = useState(false);

  const { actors } = useActors();
  const w = pylon_account?.find((w) => {
    const walletLedger = endpointToBalanceAndAccount(w).ledger;
    return walletLedger === ledger;
  });

  const walletBalance = w ? endpointToBalanceAndAccount(w).balance : 0;

  const send = async () => {
    setSending(true);

    await transfer({
      pylon: actors.neuronPylon,
      controller: principal,
      ledger: ledger,
      to: billingAccount,
      amount: amount,
    }).finally(() => {
      setAmount("");
      setSending(false);
      setOpen(false);
    });
  };

  const confirm = async () => {
    const promise = send();

    toaster.promise(promise, {
      success: {
        title: `${amount} ${tokenSymbol} sent to:`,
        description: `Vector #${vectorId} billing account`,
        duration: 3000,
      },
      error: {
        title: "Transaction failed",
        description: "Please try again.",
        duration: 3000,
      },
      loading: { title: `Sending ${amount} ${tokenSymbol}` },
    });
  };

  return (
    <Flex
      align="center"
      direction={{ base: "column", md: "row" }}
      w="100%"
      gap={6}
    >
      <Flex direction={"column"} gap={3} w="100%">
        <Field
          label="From wallet"
          invalid={!isBalanceOkay(walletBalance, Number(amount), tokenFee)}
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
                !isBalanceOkay(walletBalance, Number(amount), tokenFee)
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
        <StatRow title={"Ledger fee"} stat={`${tokenFee} ${tokenSymbol}`} />
        <ConfirmDialog
          confirmTitle={`Deposit ${tokenSymbol}`}
          openDisabled={
            !logged_in ||
            !amount ||
            !isBalanceOkay(walletBalance, Number(amount), tokenFee)
          }
          buttonIcon={<BiSend />}
          isOpen={open}
          setOpen={setOpen}
          onConfirm={confirm}
          loading={sending}
        >
          <Flex w="100%" gap={3} direction={"column"}>
            <StatBox
              title={"Deposit"}
              bg={"bg"}
              fontSize="md"
              value={`${amount} ${tokenSymbol}`}
            />
            <StatRow title={`Vector #${vectorId}`} stat={`Billing account`} />
            <StatRow title={"Total fees"} stat={`${tokenFee} ${tokenSymbol}`} />
          </Flex>
        </ConfirmDialog>
      </Flex>

      <Icon fontSize="40px" hideBelow={"md"}>
        <BiRightArrowAlt />
      </Icon>
      <Icon fontSize="40px" hideFrom={"md"}>
        <BiDownArrowAlt />
      </Icon>

      <Flex direction={"column"} gap={3} w={{ base: "100%", md: "50%" }}>
        <StatBox title={"Billing account"} bg={"bg.subtle"} fontSize="md">
          <Text lineClamp={1} fontSize="md" fontWeight={500}>
            {billingAccount}
          </Text>
          <ClipboardRoot value={billingAccount}>
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
            title={"Billing balance"}
            value={`${billingBalance.toFixed(4)} ${tokenSymbol}`}
            bg={"bg.subtle"}
            fontSize="md"
          />
          <StatBox
            title={"Billing option"}
            value={billingOption}
            bg={"bg.subtle"}
            fontSize="md"
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Billing;
