import React from "react";
import {
  VStack,
  Flex,
  Spacer,
  Text,
  Badge,
  Box,
  useColorMode,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import "../../assets/main.css";
import { Hashicon } from "@emeraldpay/hashicon-react";
import { NodeShared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import {
  darkBorderColor,
  darkGrayColorBox,
  darkGrayTextColor,
  lightBorderColor,
  lightGrayColorBox,
  lightGrayTextColor,
} from "@/colors";
import LabelBox from "./LabelBox";
import { NavLink } from "react-router-dom";

type VectorPreviewProps = {
  vector: NodeShared;
  controller: string;
};

const VectorPreview = ({ vector, controller }: VectorPreviewProps) => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <NavLink to={`/controller/${controller}/id/${vector.id}`}>
      <Box
        w="100%"
        transition="transform 0.3s"
        _hover={{
          transform: "translateY(-2px)",
          cursor: "pointer",
        }}
        border={
          colorMode === "light"
            ? `solid ${lightBorderColor} 1px`
            : `solid ${darkBorderColor} 1px`
        }
        borderRadius="md"
        p={3}
      >
        <Flex width={"100%"} align={"center"}>
          <Flex mr={3}>
            <Hashicon value={vector.id.toString()} size={45} />
          </Flex>
          <VStack align="start" spacing="0">
            <Text fontWeight="bold" fontSize={{ base: "sm", md: "lg" }}>
              Vector #{vector.id}
            </Text>
            <Text
              fontSize={"sm"}
              color={
                colorMode === "light" ? lightGrayTextColor : darkGrayTextColor
              }
            >
              ICP Neuron Vector
            </Text>
          </VStack>
          <Spacer />
          <ChevronRightIcon
            boxSize={8}
            color={
              colorMode === "light" ? lightGrayTextColor : darkGrayTextColor
            }
          />
        </Flex>
        {/* TODO add neuron snippet? */}
        {/* <Flex align={"center"} width={"100%"} gap={3} mt={3}>
          <LabelBox label={"Active"} data="Yes" />
          <LabelBox label={"Billing balance"} data="0.0000 NTN" />
        </Flex> */}
      </Box>
    </NavLink>
  );
};

export default VectorPreview;
