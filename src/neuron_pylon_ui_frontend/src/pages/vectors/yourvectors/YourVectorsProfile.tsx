import React from "react";
import {
  Box,
  VStack,
  useColorMode,
  Text,
  Flex,
  Spacer,
  Tooltip,
  Divider,
} from "@chakra-ui/react";
import { CheckCircleIcon, WarningTwoIcon } from "@chakra-ui/icons";
import {
  lightBorderColor,
  darkBorderColor,
  darkGrayColorBox,
  lightGrayColorBox,
  lightGrayTextColor,
  darkGrayTextColor,
} from "@/colors";
import { Auth } from "@/components";
import { useTypedSelector } from "@/hooks/hooks";

const YourVectorsProfile = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { vectors, status } = useTypedSelector((state) => state.Profile);
  return (
    <Box
      boxShadow="md"
      borderTopRadius="lg"
      p={3}
      mb={-1}
      border={
        colorMode === "light"
          ? `solid ${lightBorderColor} 1px`
          : `solid ${darkBorderColor} 1px`
      }
      bg={colorMode === "light" ? lightGrayColorBox : darkGrayColorBox}
    >
      <Flex mb={3} align="center">
        <VStack align="start">
          <Text
            fontSize="sm"
            fontWeight={500}
            color={
              colorMode === "light" ? lightGrayTextColor : darkGrayTextColor
            }
          >
            Active vectors
          </Text>
          <Flex gap={3} align="center">
            <Tooltip
              hasArrow
              label="Available withdrawals"
              aria-label="Available withdrawals tooltip"
            >
              <Flex align="center" gap={1.5}>
                <CheckCircleIcon color="green.500" />
                <Text fontWeight={500}>
                  {status === "succeeded"
                    ? vectors.reduce((accumulator, vector) => {
                        if (vector.active && !vector.billing.frozen) {
                          return accumulator + 1;
                        } else {
                          return accumulator;
                        }
                      }, 0)
                    : "--"}
                </Text>
              </Flex>
            </Tooltip>
            <Divider
              orientation="vertical"
              h="20px"
              borderWidth="1px"
              borderColor={
                colorMode === "light" ? lightGrayTextColor : darkGrayTextColor
              }
            />
            <Tooltip
              hasArrow
              label="Pending withdrawals"
              aria-label="Pending withdrawals tooltip"
            >
              <Flex align="center" gap={1.5}>
                <WarningTwoIcon color="red.500" />
                <Text fontWeight={500}>
                  {status === "succeeded"
                    ? vectors.reduce((accumulator, vector) => {
                        if (!vector.active || vector.billing.frozen) {
                          return accumulator + 1;
                        } else {
                          return accumulator;
                        }
                      }, 0)
                    : "--"}
                </Text>
              </Flex>
            </Tooltip>
          </Flex>
        </VStack>
        <Spacer />
        <Auth />
      </Flex>
    </Box>
  );
};

export default YourVectorsProfile;
