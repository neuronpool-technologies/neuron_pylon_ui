import { Text, Flex, Spacer, Button, Alert } from "@chakra-ui/react";
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
  DialogActionTrigger,
} from "@/components/ui/dialog";
import { ClipboardButton, ClipboardRoot } from "@/components/ui/clipboard";
import { BiReceipt, BiCollapse } from "react-icons/bi";
import { stringToIcrcAccount } from "@/utils/AccountTools";
import { AccountIdentifier, SubAccount } from "@dfinity/ledger-icp";

const RecieveToken = ({
  account,
  tokenSymbol,
}: {
  account: string;
  tokenSymbol: string;
}) => {
  let icpAddress;
  if (tokenSymbol === "ICP") {
    const icrc = stringToIcrcAccount(account);

    const subResult = SubAccount.fromBytes(icrc.subaccount[0] as Uint8Array);

    const sub = subResult instanceof Error ? undefined : subResult;

    const ai = AccountIdentifier.fromPrincipal({
      principal: icrc.owner,
      subAccount: sub,
    });

    icpAddress = ai.toHex();
  }
  return (
    <DialogRoot
      lazyMount
      placement={"center"}
      motionPreset="slide-in-bottom"
      trapFocus={false}
    >
      <DialogTrigger asChild>
        <MenuItem
          value="Recieve"
          fontSize="md"
          fontWeight={500}
          transition={"all 0.2s"}
          _hover={{ cursor: "pointer", transform: "translateX(5px)" }}
          closeOnSelect={false}
        >
          <BiReceipt />
          Recieve
        </MenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recieve {tokenSymbol}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {tokenSymbol === "ICP" ? (
            <>
              <Flex align="center" mb={3}>
                <Text fontWeight={500}>Account ID</Text>
                <Spacer />
                <ClipboardRoot value={icpAddress}>
                  <ClipboardButton
                    variant="surface"
                    rounded="md"
                    boxShadow="xs"
                    size="2xs"
                  />
                </ClipboardRoot>
              </Flex>
              <Flex bg={"bg.muted"} borderRadius="md" p={3} mb={6}>
                <Text lineClamp={4}>{icpAddress}</Text>
              </Flex>
            </>
          ) : null}
          <Flex align="center" mb={3}>
            <Text fontWeight={500}>ICRC Account</Text>
            <Spacer />
            <ClipboardRoot value={account}>
              <ClipboardButton
                variant="surface"
                rounded="md"
                boxShadow="xs"
                size="2xs"
              />
            </ClipboardRoot>
          </Flex>
          <Flex bg={"bg.muted"} borderRadius="md" p={3}>
            <Text lineClamp={4}>{account}</Text>
          </Flex>
          <Alert.Root mt={3} variant={"outline"}>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>
                Wallets that support sending to these ICRC Accounts include the
                NNS, Oisy and SwapRunner.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="surface" rounded="md" boxShadow="xs" w="100%">
              <BiCollapse /> Done
            </Button>
          </DialogActionTrigger>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default RecieveToken;
