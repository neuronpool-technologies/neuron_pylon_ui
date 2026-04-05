import { useState } from "react";
import { Text, Flex, Image as ChakraImage, Spacer } from "@chakra-ui/react";
import { MenuContent, MenuRoot, MenuTrigger } from "@/components/ui/menu";
import { useColorMode } from "@/components/ui/color-mode";
import { AccountEndpoint } from "@/declarations/neuron_pylon/neuron_pylon.did";
import { endpointToBalanceAndAccount } from "@/utils/AccountTools";
import { useTypedSelector } from "@/hooks/useRedux";
import SendToken from "./SendToken";
import RecieveToken from "./RecieveToken";
import { e8sToIcp } from "@/utils/TokenTools";
import { tokensIcons } from "@/utils/TokensIcons";

type TokenProps = {
  endpoint: AccountEndpoint;
  portalRef: React.RefObject<HTMLDivElement | null>;
};

const Token = ({ endpoint, portalRef }: TokenProps) => {
  const { toggleColorMode, colorMode } = useColorMode();
  const { balance, account } = endpointToBalanceAndAccount(endpoint);
  const { meta, status } = useTypedSelector((state) => state.Meta);
  const [open, setOpen] = useState(false);

  if (!("ic" in endpoint.endpoint)) return null;
  if (status !== "succeeded") return null;

  const walletLedger = endpoint.endpoint.ic.ledger.toString();

  const token = meta?.supported_ledgers.find((ledger) => {
    if (!("ic" in ledger?.ledger)) return false;
    return ledger?.ledger.ic.toString() === walletLedger;
  });

  const image =
    tokensIcons.find((images) => images.symbol === token?.symbol) ||
    tokensIcons[1]; // default to ICP logo

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
          bg={
            open
              ? "bg.emphasized"
              : colorMode === "light"
              ? "bg.subtle"
              : "bg.muted"
          }
          transition={"all 0.2s"}
          _hover={{
            cursor: "pointer",
            boxShadow: "md",
          }}
        >
          <ChakraImage
            src={image.src}
            alt={image.symbol}
            bg={"bg.emphasized"}
            borderRadius="full"
            h={45}
            mr={3}
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
        <SendToken
          image={image}
          ledger={walletLedger}
          tokenSymbol={token.symbol}
          tokenFee={e8sToIcp(Number(token.fee))}
          balance={balance}
        />
        <RecieveToken account={account} tokenSymbol={token.symbol} />
      </MenuContent>
    </MenuRoot>
  );
};

export default Token;
