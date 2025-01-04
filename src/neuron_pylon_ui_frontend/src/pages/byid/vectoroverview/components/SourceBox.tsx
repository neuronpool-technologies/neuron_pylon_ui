import React from "react";
import { useColorMode, Text } from "@chakra-ui/react";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import CopyAddress from "./CopyAddress";
import { SourceEndpointResp } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { LabelBox } from "@/components";

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
    <LabelBox label={`${source.name} source`}>
      <Text>{sourceAddress}</Text>
      <CopyAddress address={sourceAddress} />
    </LabelBox>
  );
};

export default SourceBox;
