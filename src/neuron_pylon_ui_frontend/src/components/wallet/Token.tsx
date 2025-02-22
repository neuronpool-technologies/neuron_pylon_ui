import { useState } from "react";
import {
  Text,
  Flex,
  Image as ChakraImage,
  Spacer,
  Button,
} from "@chakra-ui/react";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";
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
import { BiSend, BiReceipt, BiCollapse, BiCopy } from "react-icons/bi";
import IcLogo from "../../../assets/ic-logo.png";
import NtnLogo from "../../../assets/ntn-logo.png";
import SneedLogo from "../../../assets/sneed-logo.png";
import { AccountEndpoint } from "@/declarations/neuron_pylon/neuron_pylon.did";
import {
  endpointToBalanceAndAccount,
  stringToIcrcAccount,
} from "@/utils/AccountTools";
import { useTypedSelector } from "@/hooks/useRedux";
import { AccountIdentifier, SubAccount } from "@dfinity/ledger-icp";

const tokens = [
  {
    src: NtnLogo,
    symbol: "NTN",
  },
  {
    src: IcLogo,
    symbol: "ICP",
  },
  {
    src: SneedLogo,
    symbol: "SNEED",
  },
];

type TokenProps = {
  endpoint: AccountEndpoint;
  portalRef: React.RefObject<HTMLDivElement | null>;
};

const Token = ({ endpoint, portalRef }: TokenProps) => {
  const { balance, account } = endpointToBalanceAndAccount(endpoint);
  const { meta, status } = useTypedSelector((state) => state.Meta);

  if (!("ic" in endpoint.endpoint)) return null;
  if (status !== "succeeded") return null;

  const [open, setOpen] = useState(false);

  const walletLedger = endpoint.endpoint.ic.ledger.toString();

  const token = meta?.supported_ledgers.find((ledger) => {
    if (!("ic" in ledger?.ledger)) return false;
    return ledger?.ledger.ic.toString() === walletLedger;
  });

  const image =
    tokens.find((images) => images.symbol === token?.symbol) || tokens[1]; // default to ICP logo

  if (!token) return null;

  return (
    <MenuRoot
      size="md"
      positioning={{ placement: "bottom-end" }}
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <MenuTrigger asChild>
        <Flex
          align="center"
          boxShadow={open ? "md" : "xs"}
          w="100%"
          borderRadius={"md"}
          p={3}
          bg={open ? "bg.emphasized" : "bg.subtle"}
          transition={"all 0.2s"}
          _hover={{
            cursor: "pointer",
            boxShadow: "md",
          }}
        >
          <ChakraImage
            src={image.src}
            alt={image.symbol}
            bg={"bg.muted"}
            borderRadius="full"
            h={45}
            mr={3}
            p={0.5}
            w={45}
          />
          <Flex direction="column" gap={0}>
            <Text fontSize="sm" fontWeight="bold">
              {token.symbol}
            </Text>
            <Text fontSize="xs">{token.name}</Text>
          </Flex>
          <Spacer />
          <Flex direction="column" gap={0}>
            <Text fontSize="sm">{balance.toFixed(4)}</Text>
          </Flex>
        </Flex>
      </MenuTrigger>
      <MenuContent portalRef={portalRef as React.RefObject<HTMLElement>}>
        <SendToken />
        <RecieveToken account={account} tokenSymbol={token.symbol} />
      </MenuContent>
    </MenuRoot>
  );
};

export default Token;

const SendToken = () => {
  return (
    <MenuItem
      value="Send"
      fontSize="md"
      fontWeight={500}
      transition={"all 0.2s"}
      _hover={{ cursor: "pointer", transform: "translateX(5px)" }}
    >
      <BiSend /> Send
    </MenuItem>
  );
};

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
    <DialogRoot lazyMount placement={"center"} motionPreset="slide-in-bottom">
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
          <Flex align="center" mb={3}>
            <Text fontWeight="bold">Principal ID</Text>
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
          {tokenSymbol === "ICP" ? (
            <>
              <Flex align="center" mb={3} mt={6}>
                <Text fontWeight="bold">Account ID</Text>
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
              <Flex bg={"bg.muted"} borderRadius="md" p={3}>
                <Text lineClamp={4}>{icpAddress}</Text>
              </Flex>
            </>
          ) : null}
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
