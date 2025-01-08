import React from "react";
import { useColorMode, Flex, Text, Avatar } from "@chakra-ui/react";
import { ExternalLinkIcon, Spacer } from "@chakra-ui/icons";
import { NavLink } from "react-router-dom";
import { Controller } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { LabelBox } from "@/components";

type ControllersBoxProps = {
  controllers: Controller[];
};

const ControllersBox = ({ controllers }: ControllersBoxProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <LabelBox label="Controllers">
      <Flex w="100%" direction="column" gap={3}>
        {controllers.map((controller, index) => {
          const controllerAccount = encodeIcrcAccount({
            owner: controller.owner,
            subaccount: controller.subaccount[0],
          });

          return (
            <NavLink to={`/controller/${controllerAccount}`} key={index}>
              <Flex
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
                <Text fontWeight={500} noOfLines={1}>{controllerAccount}</Text>
                <Spacer />
                <ExternalLinkIcon />
              </Flex>
            </NavLink>
          );
        })}
      </Flex>
    </LabelBox>
  );
};

export default ControllersBox;
