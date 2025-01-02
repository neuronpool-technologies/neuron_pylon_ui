import React from "react";
import { Box, useColorMode, Flex, Text, VStack } from "@chakra-ui/react";
import { lightGrayColorBox, darkGrayColorBox } from "@/colors";
import { NodeShared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { e8sToIcp } from "@/tools/conversions";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import CopyAddress from "./CopyAddress";
import { LabelBox } from "@/components";

type BillingBoxProps = {
  vector: NodeShared;
};

const BillingBox = ({ vector }: BillingBoxProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const billingAddress = encodeIcrcAccount({
    owner: vector.billing.account.owner,
    subaccount: vector.billing.account.subaccount[0],
  });

  return (
    <Box>
      <Flex align="center" gap={6} mb={3}>
        <VStack align="start" spacing="0">
          <Text fontSize={"sm"} color="gray.500">
            Billing
          </Text>
          <Text fontWeight="bold" fontSize={"md"}>
            Account
          </Text>
        </VStack>
        <VStack align="start" spacing="0">
          <Text fontSize={"sm"} color="gray.500">
            Balance
          </Text>
          <Text fontWeight="bold" fontSize={"md"}>
            {e8sToIcp(Number(vector.billing.current_balance)).toFixed(4)} NTN
          </Text>
        </VStack>
      </Flex>
      <Box
        bg={colorMode === "light" ? lightGrayColorBox : darkGrayColorBox}
        borderRadius="md"
        p={3}
        mb={3}
      >
        <Text>{billingAddress}</Text>
        <CopyAddress address={billingAddress} />
      </Box>
      <LabelBox
        label="Billing option"
        data={
          vector.billing.billing_option ? "3.17 NTN per day" : "5% of Maturity"
        }
      />
    </Box>
  );
};

export default BillingBox;
