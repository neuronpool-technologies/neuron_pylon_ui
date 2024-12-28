import React from "react";
import {
  Box,
  VStack,
  useColorMode,
  Flex,
  Spacer,
  Text,
} from "@chakra-ui/react";
import {
  lightBorderColor,
  darkBorderColor,
  lightGrayColorBox,
  darkGrayColorBox,
} from "@/colors";
import { Controller } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";

type ControllersBoxProps = {
  controllers: Controller[];
};

const ControllersBox = ({ controllers }: ControllersBoxProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box
      border={
        colorMode === "light"
          ? `solid ${lightBorderColor} 1px`
          : `solid ${darkBorderColor} 1px`
      }
      borderRadius="md"
      p={3}
    >
      <Flex align="center" mb={3}>
        <VStack align="start" spacing="0">
          <Text fontSize={"sm"} color="gray.500">
            Controllers
          </Text>
        </VStack>
        <Spacer />
      </Flex>
      <Flex w="100%" direction="column" gap={3}>
        {controllers.map((controller, index) => {
          const controllerAccount = encodeIcrcAccount({
            owner: controller.owner,
            subaccount: controller.subaccount[0],
          });

          return (
            <Box
              bg={colorMode === "light" ? lightGrayColorBox : darkGrayColorBox}
              borderRadius="md"
              p={3}
              key={index}
            >
              <Text>{controllerAccount}</Text>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
};

export default ControllersBox;
