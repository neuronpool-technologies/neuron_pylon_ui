import React from "react";
import {
  Box,
  VStack,
  useColorMode,
  Text,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import {
  lightBorderColor,
  darkBorderColor,
  darkGrayColorBox,
  lightGrayColorBox,
  lightGrayTextColor,
  darkGrayTextColor,
} from "@/colors";
import { e8sToIcp } from "@/tools/conversions";
import { Auth } from "@/components";
import { useTypedSelector } from "@/hooks/hooks";

const CreateProfile = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { ntn_balance } = useTypedSelector((state) => state.Profile);

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
            Wallet balance
          </Text>
          <Flex align="center" gap={1}>
            <Text fontWeight={500}>
              {e8sToIcp(Number(ntn_balance)).toFixed(2)}
            </Text>
            <Text
              fontWeight={500}
              color={
                colorMode === "light" ? lightGrayTextColor : darkGrayTextColor
              }
            >
              NTN
            </Text>
          </Flex>
        </VStack>
        <Spacer />
        <Auth />
      </Flex>
    </Box>
  );
};

export default CreateProfile;
