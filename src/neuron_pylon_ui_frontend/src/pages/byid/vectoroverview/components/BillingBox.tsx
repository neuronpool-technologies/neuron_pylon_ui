import React from "react";
import { useColorMode, Flex, Text, Spacer, Tooltip } from "@chakra-ui/react";
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
    <Flex direction={"column"} gap={3}>
      <LabelBox label="Billing account">
        <Flex w={"100%"} align={"center"}>
          <Tooltip
            label={billingAddress}
            hasArrow
            aria-label="Vector billing account"
          >
            <Text fontWeight={500} noOfLines={1}>
              {billingAddress}
            </Text>
          </Tooltip>
          <Spacer />
          <CopyAddress address={billingAddress} />
        </Flex>
      </LabelBox>
      <Flex align="center" gap={3} w="100%">
        <LabelBox
          label="Billing balance"
          data={`${e8sToIcp(Number(vector.billing.current_balance)).toFixed(
            2
          )} NTN`}
        />
        <LabelBox
          label="Billing option"
          data={
            vector.billing.billing_option
              ? "3.17 NTN per day"
              : "5% of Maturity"
          }
        />
      </Flex>
    </Flex>
  );
};

export default BillingBox;
