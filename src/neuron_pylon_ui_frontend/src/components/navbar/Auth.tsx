import React from "react";
import { IconButton, Button, Text } from "@chakra-ui/react";
import { BiWallet } from "react-icons/bi";
import {
  ConnectWallet,
  ConnectWalletDropdownMenuDisconnectItem,
  ConnectWalletButtonProps,
} from "@nfid/identitykit/react";

const Auth = () => {
  return (
    <ConnectWallet
      connectButtonComponent={CustomConnectWalletButton}
      connectedButtonComponent={CustomConnectedWalletButton}
      dropdownMenuComponent={CustomConnectedWalletButton}
    />
  );
};

export default Auth;

const CustomConnectWalletButton = ({ onClick }: ConnectWalletButtonProps) => {
  return (
    <>
      <Button
        variant="surface"
        colorPalette="blue"
        rounded="md"
        boxShadow="xs"
        hideBelow="md"
        onClick={onClick}
      >
        <BiWallet />
        <Text>Connect</Text>
      </Button>
      <IconButton
        variant="surface"
        colorPalette="blue"
        rounded="md"
        hideFrom="md"
        onClick={onClick}
      >
        <BiWallet />
      </IconButton>
    </>
  );
};

const CustomConnectedWalletButton = ({
  connectedAccount,
  icpBalance,
  disconnect,
}: {
  connectedAccount: string;
  icpBalance?: number;
  disconnect?: () => unknown;
}) => {
  return (
    <Button onClick={disconnect}>Disconnect</Button>
    // <ConnectedWalletButton {...props}>
    //   {`Disconnect ${connectedAccount} ${icpBalance} ICP`}
    // </ConnectedWalletButton>
  );
};
