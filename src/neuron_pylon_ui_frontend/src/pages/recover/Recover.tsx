import {
  Box,
  Button,
  Center,
  Heading,
  Highlight,
  Text,
  VStack,
  Image as ChakraImage,
} from "@chakra-ui/react";
import { Header } from "@/components";
import mascot from "../../../assets/mascot.svg";
import { BiReset } from "react-icons/bi";
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { HttpAgent } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { useTypedSelector } from "@/hooks/useRedux";
import { useState } from "react";
import {
  endpointToBalanceAndAccount,
  stringToIcrcAccount,
} from "@/utils/AccountTools";
import { toaster } from "@/components/ui/toaster";

const Recover = () => {
  const { meta } = useTypedSelector((state) => state.Meta);
  const { logged_in, principal, pylon_account } = useTypedSelector(
    (state) => state.Wallet
  );
  const [checking, setChecking] = useState<boolean>(false);
  if (!meta || !meta.supported_ledgers) return null;

  const recover = async () => {
    const authClient = await AuthClient.create();
    const identity = authClient.getIdentity();

    setChecking(true);

    try {
      let tokensRecovered = 0;
      let totalAmount = 0;

      const agent = await HttpAgent.create({
        identity: identity,
        host: "https://icp-api.io",
      });

      for (let supported_ledger of meta.supported_ledgers) {
        if (!("ic" in supported_ledger?.ledger)) continue;

        const ledger = IcrcLedgerCanister.create({
          agent,
          canisterId: supported_ledger.ledger.ic,
        });

        const pylonAccount = stringToIcrcAccount(
          endpointToBalanceAndAccount(pylon_account[0]).account
        );

        const balance = await ledger.balance({
          owner: stringToIcrcAccount(principal).owner,
          subaccount: undefined,
          certified: false,
        });

        const ledgerFee = await ledger.transactionFee({
          certified: false,
        });

        if (balance > ledgerFee) {
          const transferAmount = balance - ledgerFee;

          await ledger.transfer({
            to: {
              owner: pylonAccount.owner,
              subaccount: pylonAccount.subaccount,
            },
            amount: transferAmount,
          });

          tokensRecovered++;
          totalAmount += Number(transferAmount);
        }
      }

      if (tokensRecovered === 0) {
        throw new Error("No recoverable tokens were found in your account.");
      }

      return tokensRecovered;
    } catch (error) {
      throw error;
    } finally {
      setChecking(false);
    }
  };

  return (
    <Header>
      <Center py={4} px={4}>
        <VStack gap={4}>
          <Box maxW="300px" mx="auto">
            <ChakraImage src={mascot} alt="NeuronPool Mascot" width="100%" />
          </Box>

          <VStack gap={3} textAlign="center">
            <Heading size={{ base: "xl", md: "2xl" }} letterSpacing="tight">
              <Highlight
                query={"Lost"}
                styles={{
                  px: "1",
                  py: "1",
                  color: "blue.fg",
                }}
              >
                Lost your tokens?
              </Highlight>
            </Heading>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="fg.muted"
              maxW="500px"
            >
              If you've accidentally sent tokens to the wrong account, you may
              be able to recover them by checking below.
            </Text>
          </VStack>

          <Button
            variant="surface"
            colorPalette={"blue"}
            rounded="md"
            boxShadow="xs"
            disabled={checking || !logged_in}
            loading={checking}
            onClick={() => {
              const promise = recover();

              toaster.promise(promise, {
                success: {
                  title: "Successfully recovered tokens!",
                  description:
                    "Tokens have been recovered and transferred to your Pylon account.",
                  duration: 3000,
                },
                error: {
                  title: "Recovery failed",
                  description:
                    "No recoverable tokens were found in your account.",
                  duration: 3000,
                },
                loading: { title: "Searching for recoverable tokens..." },
              });
            }}
          >
            <BiReset /> Recover My Tokens
          </Button>
        </VStack>
      </Center>
    </Header>
  );
};

export default Recover;
