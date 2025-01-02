import React from "react";
import { Box, useColorMode, VStack, Text } from "@chakra-ui/react";
import { lightGrayColorBox, darkGrayColorBox } from "@/colors";

type LabelBoxProps = {
  label: string;
  data: string;
};

const LabelBox = ({ label, data }: LabelBoxProps) => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <VStack align="start" spacing={3} w="100%">
      <Text fontSize={"sm"} color="gray.500">
        {label}
      </Text>
      <Box
        bg={colorMode === "light" ? lightGrayColorBox : darkGrayColorBox}
        borderRadius="md"
        p={3}
        w="100%"
      >
        <Text noOfLines={1}>{data}</Text>
      </Box>
    </VStack>
  );
};

export default LabelBox;
