import React from "react";
import { useColorMode, Flex, Text, Spacer } from "@chakra-ui/react";
import { lightGrayTextColor, darkGrayTextColor } from "../colors";

const InfoRow = ({ title, stat, children }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <>
      <Flex w="100%" gap={1} align="center">
        <Text
          noOfLines={1}
          color={colorMode === "light" ? lightGrayTextColor : darkGrayTextColor}
          fontWeight={500}
        >
          {title}
        </Text>
        {children}
        <Spacer />
        <Flex fontWeight={500} noOfLines={1}>
          {stat}
        </Flex>
      </Flex>
    </>
  );
};

export default InfoRow;
