import React from "react";
import {
  Box,
  useColorMode,
  Flex,
  Text,
  VStack,
  Divider,
  Spinner,
} from "@chakra-ui/react";
import {
  darkColorBox,
  lightColorBox,
  lightBorderColor,
  darkBorderColor,
  darkColor,
  lightColor,
} from "@/colors";
import { e8sToIcp } from "@/tools/conversions";
import { InfoRow } from "@/components";
import { useTypedSelector } from "@/hooks/hooks";

const PylonStats = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { status, total_stake, total_maturity, total_vectors } =
    useTypedSelector((state) => state.Meta);

  return (
    <Box>
      <Flex mt={6}>
        <Text
          fontWeight="bold"
          color={colorMode === "light" ? darkColor : lightColor}
        >
          Vector statistics
        </Text>
      </Flex>
      <Box
        boxShadow="md"
        borderRadius="lg"
        p={3}
        mt={3}
        border={
          colorMode === "light"
            ? `solid ${lightBorderColor} 1px`
            : `solid ${darkBorderColor} 1px`
        }
        bg={colorMode === "light" ? lightColorBox : darkColorBox}
      >
        <VStack align="start" p={3} gap={3}>
          <InfoRow
            title={"Neuron vectors"}
            stat={
              status === "succeeded" ? total_vectors : <Spinner size="sm" />
            }
          />
          <Divider />
          <InfoRow
            title={"Total staked"}
            stat={
              status === "succeeded" ? (
                `${Math.round(
                  e8sToIcp(Number(total_stake))
                ).toLocaleString()} ICP`
              ) : (
                <Spinner size="sm" />
              )
            }
          />
          <Divider />
          <InfoRow
            title={"Incoming maturity"}
            stat={
              status === "succeeded" ? (
                `${Math.round(
                  e8sToIcp(Number(total_maturity))
                ).toLocaleString()} ICP`
              ) : (
                <Spinner size="sm" />
              )
            }
          />
        </VStack>
      </Box>
    </Box>
  );
};

export default PylonStats;
