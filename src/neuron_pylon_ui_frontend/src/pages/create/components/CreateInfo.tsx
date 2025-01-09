import React from "react";
import { Divider, VStack, Spinner } from "@chakra-ui/react";
import { InfoRow } from "@/components";
import { useTypedSelector } from "@/hooks/hooks";
import { e8sToIcp } from "@/tools/conversions";

const CreateInfo = () => {
  const { billing, status } = useTypedSelector((state) => state.Meta);
  return (
    <VStack align="start" p={3} gap={3} w="100%">
      <InfoRow
        title={"Vector type"}
        stat={
          status === "succeeded" ? `ICP Neuron` : <Spinner size="sm" />
        }
      />
      <Divider />
      <InfoRow
        title={"Create cost"}
        stat={
          status === "succeeded" ? (
            `${
              "min_create_balance" in billing
                ? `${e8sToIcp(Number(billing.min_create_balance)).toFixed(
                    2
                  )} NTN`
                : null
            }`
          ) : (
            <Spinner size="sm" />
          )
        }
      />
      <Divider />
      <InfoRow
        title={"Edit cost"}
        stat={
          status === "succeeded" ? (
            `${
              "operation_cost" in billing
                ? `${e8sToIcp(Number(billing.operation_cost)).toFixed(4)} NTN`
                : null
            }`
          ) : (
            <Spinner size="sm" />
          )
        }
      />
    </VStack>
  );
};

export default CreateInfo;
