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
import { BiSend, BiRightArrowAlt } from "react-icons/bi";
import {
  endpointToBalanceAndAccount,
  isBalanceOkay,
} from "@/utils/AccountTools";
import { transfer } from "@/client/commands";
import { useTypedSelector } from "@/hooks/useRedux";
import {
  NodeShared,
  PylonMetaResp,
} from "@/declarations/neuron_pylon/neuron_pylon.did";
import { extractNodeType } from "@/utils/Node";
import { tokensIcons } from "@/utils/TokensIcons";
import { e8sToIcp } from "@/utils/TokenTools";

const Deposit = ({
  vector,
  meta,
}: {
  vector: NodeShared;
  meta: PylonMetaResp;
}) => {
  const { logged_in, principal, pylon_account, actors } = useTypedSelector(
    (state) => state.Wallet
  );
  const [sendAmount, setSendAmount] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [open, setOpen] = useState(false);

  const nodeType = extractNodeType(vector, meta);

  const { label, symbol, active, fee, amount, refreshing, minimum } =
    nodeType.label !== "Mint"
      ? { ...nodeType }
      : {
          label: "Mint",
          symbol: "ICP",
          active: nodeType.active,
          fee: 10000,
          amount: nodeType.amount,
          refreshing: nodeType.refreshing,
          minimum: nodeType.minimum,
        };

  const tokenImage =
    tokensIcons.find((images) => images.symbol === symbol) || tokensIcons[1]; // default to ICP logo

  const source = endpointToBalanceAndAccount(vector.sources[0]);

  const realFee = e8sToIcp(Number(fee * 2)); // depositing has at least two fees

  const w = pylon_account?.find((w) => {
    const walletLedger = endpointToBalanceAndAccount(w).ledger;
    return walletLedger === source.ledger;
  });

  const walletBalance = w ? endpointToBalanceAndAccount(w).balance : 0;

  const send = async () => {
    setSending(true);

    await transfer({
      pylon: actors.neuronPylon,
      controller: principal,
      ledger: source.ledger,
      to: source.account,
      amount: sendAmount,
    }).finally(() => {
      setSendAmount("");
      setSending(false);
      setOpen(false);
    });
  };

  const confirm = async () => {
    const promise = send();

    toaster.promise(promise, {
      success: {
        title: `${sendAmount} ${symbol} sent to:`,
        description: `Vector #${vector.id} source account`,
        duration: 3000,
      },
      error: {
        title: "Transaction failed",
        description: "Please try again.",
        duration: 3000,
      },
      loading: { title: `Sending ${sendAmount} ${symbol}` },
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
          invalid={!isBalanceOkay(walletBalance, Number(sendAmount), realFee)}
          disabled={sending}
        >
          <InputGroup
            w="100%"
            startElement={
              <ChakraImage
                src={tokenImage.src}
                alt={tokenImage.symbol}
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
                onClick={() => setSendAmount(walletBalance.toString())}
                disabled={sending || !logged_in}
                colorPalette={"gray"}
              >
                Max
              </Button>
            }
          >
            <Input
              type="number"
              placeholder={`${symbol} amount`}
              size="lg"
              bg={
                !isBalanceOkay(walletBalance, Number(sendAmount), realFee)
                  ? "bg.error"
                  : ""
              }
              onChange={(e) => setSendAmount(e.target.value)}
              value={sendAmount}
            />
          </InputGroup>
        </Field>
        <StatRow
          title={"Balance"}
          stat={`${walletBalance.toFixed(4)} ${symbol}`}
        />
        <StatRow title={"Ledger fee"} stat={`${realFee} ${symbol}`} />
        <ConfirmDialog
          confirmTitle={`Deposit ${symbol}`}
          openDisabled={
            !logged_in ||
            !sendAmount ||
            !isBalanceOkay(walletBalance, Number(sendAmount), realFee)
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
              bg={"bg.panel"}
              fontSize="md"
              value={`${sendAmount} ${symbol}`}
            />
            <StatRow title={`Vector #${vector.id}`} stat={`${label} source`} />
            <StatRow title={"Total fees"} stat={`${realFee} ${symbol}`} />
          </Flex>
        </ConfirmDialog>
      </Flex>

      <Icon fontSize="40px" hideBelow={"md"}>
        <BiRightArrowAlt />
      </Icon>
      <Icon fontSize="40px" hideFrom={"md"} transform="rotate(90deg)">
        <BiRightArrowAlt />
      </Icon>

      <Flex direction={"column"} gap={3} w={{ base: "100%", md: "50%" }}>
        <StatBox title={`${label} source`} bg={"bg.subtle"} fontSize="md">
          <Text truncate fontSize="md" fontWeight={500}>
            {source.account}
          </Text>
          <ClipboardRoot value={source.account}>
            <ClipboardIconButton
              variant="surface"
              colorPalette={"gray"}
              rounded="md"
              boxShadow="xs"
              size="2xs"
            />
          </ClipboardRoot>
        </StatBox>
        <Flex gap={3} align="center" color={active ? "" : "red.solid"}>
          <StatBox
            title={active ? "Source balance" : "Source frozen"}
            value={`${source.balance.toFixed(4)} ${symbol}`}
            bg={"bg.subtle"}
            fontSize="md"
            animation={source.balance > 0 && active}
          />
          <Icon size="lg" color="bg.inverted">
            <BiRightArrowAlt />
          </Icon>
          {label === "Stake" ? (
            <StatBox
              title={
                active
                  ? amount !== undefined && Number(amount) > 0
                    ? "Neuron stake"
                    : minimum ?? "Neuron stake"
                  : "Neuron frozen"
              }
              value={`${amount} ${symbol}`}
              bg={"bg.subtle"}
              fontSize="md"
              animation={refreshing && active}
            />
          ) : label === "Split" ? (
            <StatBox
              title={active ? label : `${label} frozen`}
              value={`${symbol}`}
              bg={"bg.subtle"}
              fontSize="md"
            />
          ) : label === "Mint" ? (
            <StatBox
              title={active ? `${label} ${minimum}` : `${label} frozen`}
              value={`${"NTC"}`}
              bg={"bg.subtle"}
              fontSize="md"
            />
          ) : label === "Redeem" ? (
            <StatBox
              title={active ? `${label}` : `${label} frozen`}
              value={`${"NTC"}`}
              bg={"bg.subtle"}
              fontSize="md"
            />
          ) : null}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Deposit;
