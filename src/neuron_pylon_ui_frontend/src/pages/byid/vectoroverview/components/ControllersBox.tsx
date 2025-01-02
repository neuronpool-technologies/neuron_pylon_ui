import React from "react";
import { Box, useColorMode, Flex, Text, Avatar } from "@chakra-ui/react";
import { ExternalLinkIcon, Spacer } from "@chakra-ui/icons";
import { lightGrayColorBox, darkGrayColorBox } from "@/colors";
import { NavLink } from "react-router-dom";
import { Controller } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";

type ControllersBoxProps = {
  controllers: Controller[];
};

const ControllersBox = ({ controllers }: ControllersBoxProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box>
      <Flex align="center" mb={3}>
        <Text fontSize={"sm"} color="gray.500">
          Controllers
        </Text>
      </Flex>
      <Flex w="100%" direction="column" gap={3}>
        {controllers.map((controller, index) => {
          const controllerAccount = encodeIcrcAccount({
            owner: controller.owner,
            subaccount: controller.subaccount[0],
          });

          return (
            <NavLink to={`/controller/${controllerAccount}`} key={index}>
              <Flex
                bg={
                  colorMode === "light" ? lightGrayColorBox : darkGrayColorBox
                }
                borderRadius="md"
                p={3}
                align={"center"}
                _hover={{
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                gap={2}
              >
                <Avatar
                  size="xs"
                  src={`https://identicons.github.com/${controllerAccount.slice(
                    0,
                    3
                  )}.png`}
                  name={controllerAccount}
                  ignoreFallback
                />
                <Text>{controllerAccount}</Text>
                <Spacer />
                <ExternalLinkIcon />
              </Flex>
            </NavLink>
          );
        })}
      </Flex>
    </Box>
  );
};

export default ControllersBox;
