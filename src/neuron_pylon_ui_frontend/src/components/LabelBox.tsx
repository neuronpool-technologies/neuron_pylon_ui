import React, { ReactNode } from "react";
import { Box, useColorMode, VStack, Text } from "@chakra-ui/react";
import {
  lightGrayColorBox,
  darkGrayColorBox,
  darkGrayTextColor,
  lightGrayTextColor,
} from "@/colors";

type LabelBoxProps = {
  label: string;
  data?: string;
  children?: ReactNode;
};

const LabelBox = ({ label, data, children }: LabelBoxProps) => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <VStack align="start" spacing={3} w="100%">
      <Text
        fontSize={"sm"}
        color={colorMode === "light" ? lightGrayTextColor : darkGrayTextColor}
        fontWeight={500}
      >
        {label}
      </Text>
      <Box
        bg={colorMode === "light" ? lightGrayColorBox : darkGrayColorBox}
        borderRadius="md"
        p={3}
        w="100%"
      >
        <Text noOfLines={1} fontWeight={500}>
          {data}
        </Text>
        {children}
      </Box>
    </VStack>
  );
};

export default LabelBox;
