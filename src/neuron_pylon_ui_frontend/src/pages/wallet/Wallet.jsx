import React from "react";
import {
  Box,
  Heading,
  Divider,
  VStack,
  useColorMode,
  Flex,
  Container,
} from "@chakra-ui/react";
import { NtnWallet, WalletBalance } from "./components";
import {
  darkColorBox,
  lightColorBox,
  lightBorderColor,
  darkBorderColor,
} from "../../colors";
import { WalletFaq } from "../../components";
import { useSelector } from "react-redux";

const Wallet = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const logged_in = useSelector((state) => state.Profile.logged_in);

  return (
    <Container maxW="xl" my={5}>
      {logged_in ? <WalletBalance /> : null}
      <Box
        boxShadow="md"
        borderRadius="lg"
        p={3}
        border={
          colorMode === "light"
            ? `solid ${lightBorderColor} 1px`
            : `solid ${darkBorderColor} 1px`
        }
        bg={colorMode === "light" ? lightColorBox : darkColorBox}
      >
        <Flex align="center" mb={3}>
          <Heading size={"md"} noOfLines={1}>
            Wallet
          </Heading>
        </Flex>
        <VStack spacing={3} align="start">
          <Divider />
          <NtnWallet />
        </VStack>
      </Box>
      <WalletFaq />
    </Container>
  );
};

export default Wallet;
