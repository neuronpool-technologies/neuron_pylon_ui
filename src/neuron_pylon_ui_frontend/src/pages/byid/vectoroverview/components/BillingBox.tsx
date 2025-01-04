import React from "react";
import { useColorMode, Flex, Text } from "@chakra-ui/react";
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
        <Text>{billingAddress}</Text>
        <CopyAddress address={billingAddress} />
      </LabelBox>
      <LabelBox
        label="Billing balance"
        data={`${e8sToIcp(Number(vector.billing.current_balance)).toFixed(
          4
        )} NTN`}
      />
      <LabelBox
        label="Billing option"
        data={
          vector.billing.billing_option ? "3.17 NTN per day" : "5% of Maturity"
        }
      />
    </Flex>
  );
};

export default BillingBox;
