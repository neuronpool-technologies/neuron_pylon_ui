import React from "react";
import { Divider, VStack, Spinner } from "@chakra-ui/react";
import { InfoRow } from "../../../components";
import { useSelector } from "react-redux";
import { e8sToIcp } from "../../../tools/conversions";

const MetaInfo = () => {
  const { billing, status } = useSelector((state) => state.Meta);
  
  return (
    <VStack align="start" p={3} gap={3} w="100%">
      <InfoRow
        title={"Creation fee"}
        stat={
          status === "succeeded" ? (
            `${e8sToIcp(Number(billing.min_create_balance))} NTN`
          ) : (
            <Spinner size="sm" />
          )
        }
      />
      <Divider />
      <InfoRow
        title={"Operation fee"}
        stat={
          status === "succeeded" ? (
            `${e8sToIcp(Number(billing.operation_cost))} NTN`
          ) : (
            <Spinner size="sm" />
          )
        }
      />
    </VStack>
  );
};

export default MetaInfo;
