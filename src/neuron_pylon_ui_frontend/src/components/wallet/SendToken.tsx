import { useState } from "react";
import { Flex, Button, Input } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { InputGroup } from "@/components/ui/input-group";
import { MenuItem } from "@/components/ui/menu";
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
import { BiSend } from "react-icons/bi";
import { isAccountOkay, isBalanceOkay } from "@/utils/AccountTools";
import { toaster } from "@/components/ui/toaster";
import { useActors } from "@/hooks/useActors";
import { transfer } from "@/client/commands";
import { StatRow } from "@/components";

const SendToken = ({
  ledger,
  tokenSymbol,
  tokenFee,
  balance,
}: {
  ledger: string;
  tokenSymbol: string;
  tokenFee: number;
  balance: number;
}) => {
  const [account, setAccount] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [open, setOpen] = useState(false);

  const { identity, actors } = useActors();
  const principal = identity?.getPrincipal().toString();

  const send = async () => {
    setSending(true);

    await transfer({
      pylon: actors.neuronPylon,
      controller: principal,
      ledger: ledger,
      to: account,
      amount: amount,
    }).finally(() => {
      setSending(false);
      setOpen(false);
    });
  };

  return (
    <DialogRoot
      lazyMount
      placement={"center"}
      motionPreset="slide-in-bottom"
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <DialogTrigger asChild>
        <MenuItem
          value="Send"
          fontSize="md"
          fontWeight={500}
          transition={"all 0.2s"}
          _hover={{ cursor: "pointer", transform: "translateX(5px)" }}
          closeOnSelect={false}
        >
          <BiSend /> Send
        </MenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send {tokenSymbol}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Flex w="100%" gap={3} direction={"column"}>
            <Field
              label="Recipient"
              invalid={!isAccountOkay(account)}
              disabled={sending}
            >
              <Input
                placeholder="Principal, ICRC (e.g., ntohy-uex..., ...)"
                size="lg"
                bg={!isAccountOkay(account) ? "bg.error" : ""}
                onChange={(e) => setAccount(e.target.value)}
              />
            </Field>
            <Field
              label="Amount"
              invalid={!isBalanceOkay(balance, Number(amount), tokenFee)}
              disabled={sending}
            >
              <InputGroup
                w="100%"
                endElement={
                  <Button
                    variant="surface"
                    rounded="md"
                    boxShadow="xs"
                    size="2xs"
                    onClick={() => setAmount(balance.toString())}
                    disabled={sending}
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
                    !isBalanceOkay(balance, Number(amount), tokenFee)
                      ? "bg.error"
                      : ""
                  }
                  onChange={(e) => setAmount(e.target.value)}
                  value={amount}
                />
              </InputGroup>
            </Field>
          </Flex>
          <Flex w="100%" direction={"column"} mt={6} gap={3}>
            <StatRow
              title={"Balance"}
              stat={`${balance.toFixed(4)} ${tokenSymbol}`}
            />
            <StatRow title={"Ledger fee"} stat={`${tokenFee} ${tokenSymbol}`} />
          </Flex>
        </DialogBody>
        <DialogFooter>
          <Button
            disabled={
              !amount ||
              !account ||
              !isAccountOkay(account) ||
              !isBalanceOkay(balance, Number(amount), tokenFee)
            }
            variant="surface"
            rounded="md"
            boxShadow="xs"
            w="100%"
            loading={sending}
            onClick={() => {
              const promise = send();

              toaster.promise(promise, {
                success: {
                  title: `${amount} ${tokenSymbol} sent to:`,
                  description: account,
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
            <BiSend /> Send {tokenSymbol}
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default SendToken;
