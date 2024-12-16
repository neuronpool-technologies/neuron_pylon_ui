import React from "react";
import { Divider, VStack, Spinner } from "@chakra-ui/react";
import { HintPopover, InfoRow } from "../../../components";
import { useSelector } from "react-redux";

const VectorInfo = () => {
  const billingInfo = useSelector((state) => state.Billing);
  
  console.log("todo add here", billingInfo)
  return (
    <VStack align="start" p={3} gap={3} w="100%">
      <InfoRow title={"Creation fee"} stat={"0.5 NTN"} />
      <Divider />
      <InfoRow title={"Minimum stake"} stat={"20 ICP"} />
      <Divider />
      <InfoRow title={"Maturity fee"} stat={"5%"}>
        <HintPopover
          details={
            "This fee is deducted from maturity only and is not taken from your staked amount."
          }
        />
      </InfoRow>
    </VStack>
  );
};

export default VectorInfo;
