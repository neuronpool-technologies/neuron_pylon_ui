import React from "react";
import { useColorMode, Text, Flex } from "@chakra-ui/react";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import CopyAddress from "./CopyAddress";
import { SourceEndpointResp } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { LabelBox } from "@/components";
import { e8sToIcp } from "@/tools/conversions";

type SourceBoxProps = {
  source: SourceEndpointResp;
};

const SourceBox = ({ source }: SourceBoxProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  if (!("ic" in source.endpoint)) return;

  const sourceAddress = encodeIcrcAccount({
    owner: source.endpoint.ic.account.owner,
    subaccount: source.endpoint.ic.account.subaccount[0],
  });

  return (
    <Flex w={"100%"} direction={"column"} gap={3}>
      <LabelBox label={`${source.name} source`}>
        <Text>{sourceAddress}</Text>
        <CopyAddress address={sourceAddress} />
      </LabelBox>
      <LabelBox
        label="Source balance"
        data={`${e8sToIcp(Number(source.balance)).toFixed(4)} ICP`}
      />
    </Flex>
  );
};

export default SourceBox;
