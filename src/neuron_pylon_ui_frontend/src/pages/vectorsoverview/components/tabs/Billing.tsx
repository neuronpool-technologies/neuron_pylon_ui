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
import { NodeShared } from "@/declarations/neuron_pylon/neuron_pylon.did";
import { extractNodeType } from "@/utils/Node";
import { e8sToIcp } from "@/utils/TokenTools";
import { tokensIcons } from "@/utils/TokensIcons";

const Billing = ({ vector }: { vector: NodeShared }) => {
  const { logged_in, principal, pylon_account } = useTypedSelector(
    (state) => state.Wallet
  );
  const { meta } = useTypedSelector((state) => state.Meta);

  const [amount, setAmount] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [open, setOpen] = useState(false);

  if (!meta) return null;

  const { billing } = extractNodeType(vector, meta);

  const { actors } = useActors();
  const w = pylon_account?.find((w) => {
    const walletLedger = endpointToBalanceAndAccount(w).ledger;
    return walletLedger === billing.ledger;
  });

  const billingTokenInfo = meta?.supported_ledgers.find((ledger) => {
    if (!("ic" in ledger?.ledger)) return false;
    return ledger?.ledger.ic.toString() === billing.ledger;
  });

  if (!billingTokenInfo) return null;

  const billingImage =
    tokensIcons.find((images) => images.symbol === billingTokenInfo.symbol) ||
    tokensIcons[1];

  const walletBalance = w ? endpointToBalanceAndAccount(w).balance : 0;

  const realFee = e8sToIcp(Number(billingTokenInfo.fee));

  const send = async () => {
    setSending(true);

    await transfer({
      pylon: actors.neuronPylon,
      controller: principal,
      ledger: billing.ledger,
      to: billing.account,
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
        title: `${amount} ${billingTokenInfo.symbol} sent to:`,
        description: `Vector #${vector.id} billing account`,
        duration: 3000,
      },
      error: {
        title: "Transaction failed",
        description: "Please try again.",
        duration: 3000,
      },
      loading: { title: `Sending ${amount} ${billingTokenInfo.symbol}` },
    });
  };

  const billingOption =
    billing.cost_per_day > 0
      ? `${e8sToIcp(Number(billing.cost_per_day))} ${
          billingTokenInfo.symbol
        } per day`
      : billing.transaction_percentage_fee_e8s > 0
      ? "5% of Maturity"
      : "None";

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
          invalid={!isBalanceOkay(walletBalance, Number(amount), realFee)}
          disabled={sending}
        >
          <InputGroup
            w="100%"
            startElement={
              <ChakraImage
                src={billingImage.src}
                alt={billingImage.symbol}
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
              placeholder={`${billingTokenInfo.symbol} amount`}
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
          stat={`${walletBalance.toFixed(4)} ${billingTokenInfo.symbol}`}
        />
        <StatRow
          title={"Ledger fee"}
          stat={`${realFee} ${billingTokenInfo.symbol}`}
        />
        <ConfirmDialog
          confirmTitle={`Deposit ${billingTokenInfo.symbol}`}
          openDisabled={
            !logged_in ||
            !amount ||
            !isBalanceOkay(walletBalance, Number(amount), realFee)
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
              value={`${amount} ${billingTokenInfo.symbol}`}
            />
            <StatRow title={`Vector #${vector.id}`} stat={`Billing account`} />
            <StatRow
              title={"Total fees"}
              stat={`${realFee} ${billingTokenInfo.symbol}`}
            />
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
            {billing.account}
          </Text>
          <ClipboardRoot value={billing.account}>
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
            value={`${e8sToIcp(Number(billing.current_balance)).toFixed(4)} ${
              billingTokenInfo.symbol
            }`}
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
