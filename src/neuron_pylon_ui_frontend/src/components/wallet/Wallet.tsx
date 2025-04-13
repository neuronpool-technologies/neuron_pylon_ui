import { useEffect, useRef } from "react";
import {
  Button,
  Text,
  Flex,
  IconButton,
  Spacer,
  Image as ChakraImage,
  Separator,
} from "@chakra-ui/react";
import {
  DrawerActionTrigger,
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { BiWallet, BiPowerOff, BiCollapse } from "react-icons/bi";
import { useActors } from "@/hooks/useActors";
import { Usergeek } from "usergeek-ic-js";
import { useTypedDispatch, useTypedSelector } from "@/hooks/useRedux";
import { refreshWallet, setCleanup } from "@/state/WalletSlice";
import IcLogo from "../../../assets/ic-logo.png";
import Token from "./Token";
import { Actor } from "@dfinity/agent";

const Wallet = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { identity, isAuthenticated, login, logout, actors } = useActors();
  const { principal } = useTypedSelector((state) => state.Wallet);

  const dispatch = useTypedDispatch();
  const { pylon_account, status } = useTypedSelector((state) => state.Wallet);

  const setupWallet = async () => {
    Usergeek.init({
      apiKey: process.env.REACT_APP_USERGEEK_KEY ?? "",
      host: "https://lpfay-3aaaa-aaaal-qbupa-cai.raw.icp0.io",
    });

    // Create a copy of the actors object to update
    const updatedActors = { ...actors };

    if (actors.neuronPylon && identity) {
      const agent = Actor.agentOf(actors.neuronPylon);
      if (agent && agent.replaceIdentity) {
        agent.replaceIdentity(identity);
        // Update the neuronPylon actor in our copy
        updatedActors.neuronPylon = actors.neuronPylon;
      }
    }

    const principal = identity?.getPrincipal();
    Usergeek.setPrincipal(principal);
    Usergeek.trackSession();

    dispatch(
      refreshWallet({
        principal: principal,
        pylon: actors.neuronPylon,
        shouldRegister: true, // Register on initial setup
        logout: logout,
        actors: updatedActors, // Pass the updated actors to the store
      })
    );
  };

  const cleanupWallet = async () => {
    dispatch(setCleanup());
    Usergeek.setPrincipal(undefined);
    await logout();
    const agent = Actor.agentOf(actors.neuronPylon);
    if (agent && agent.invalidateIdentity) {
      agent.invalidateIdentity();
    }
    window.location.reload();
  };

  useEffect(() => {
    if (actors.neuronPylon && isAuthenticated) {
      setupWallet();

      const intervalId = setInterval(() => {
        // Don't register on periodic refreshes
        dispatch(
          refreshWallet({
            principal: identity?.getPrincipal(),
            pylon: actors.neuronPylon,
            shouldRegister: false,
            logout: logout,
            actors: actors, // Also include actors in periodic refreshes
          })
        );
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, principal, actors]);

  return !isAuthenticated ? (
    <Button
      variant="surface"
      colorPalette="blue"
      rounded="md"
      boxShadow="xs"
      loading={status === "loading"}
      onClick={async () => await login()}
    >
      <ChakraImage
        src={IcLogo}
        alt="Internet identity logo"
        h={"20px"}
        w={"auto"}
      />
      <Text hideBelow={"md"}>Connect Identity</Text>
    </Button>
  ) : (
    <DrawerRoot>
      <DrawerBackdrop />
      <DrawerTrigger asChild>
        <Button
          variant="surface"
          colorPalette="blue"
          rounded="md"
          boxShadow="xs"
        >
          <BiWallet />
          <Text hideBelow={"md"}>
            {principal.substring(0, 5) + "..." + principal.substring(60, 63)}
          </Text>
        </Button>
      </DrawerTrigger>
      <DrawerContent offset="4" rounded="md" ref={contentRef}>
        <DrawerHeader>
          <DrawerTitle>
            <Flex align="center" gap={1}>
              <BiWallet />
              {principal.substring(0, 7) + "..." + principal.substring(57, 63)}
              <Spacer />
              <DrawerActionTrigger asChild>
                <IconButton variant="ghost" aria-label="close">
                  <BiCollapse />
                </IconButton>
              </DrawerActionTrigger>
            </Flex>
          </DrawerTitle>
          <Separator mt={3} />
        </DrawerHeader>
        <DrawerBody>
          <Flex align="start" direction={"column"} gap={3}>
            {pylon_account.map((account, index) => {
              return (
                <Token key={index} endpoint={account} portalRef={contentRef} />
              );
            })}
          </Flex>
        </DrawerBody>
        <DrawerFooter>
          <DrawerActionTrigger asChild>
            <Button
              variant="surface"
              rounded="md"
              boxShadow="xs"
              w="100%"
              onClick={cleanupWallet}
              colorPalette="red"
            >
              <BiPowerOff /> Disconnect
            </Button>
          </DrawerActionTrigger>
        </DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
  );
};

export default Wallet;
