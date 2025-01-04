import React from "react";
import {
  useColorMode,
  Flex,
  Text,
  VStack,
  Divider,
  Avatar,
} from "@chakra-ui/react";
import { darkGrayTextColor, lightGrayTextColor } from "@/colors";
import { NodeShared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { VectorPreview } from "@/components";

type ControllerOverviewProps = {
  controller: string;
  vectors: NodeShared[];
};

const ControllerOverview = ({
  vectors,
  controller,
}: ControllerOverviewProps) => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Flex direction="column" gap={3} w="100%">
      <Flex align="center" w="100%">
        <Avatar
          h={45}
          mr={3}
          w={45}
          src={`https://identicons.github.com/${controller.slice(0, 3)}.png`}
          name={controller}
          ignoreFallback
        />
        <VStack align="start" spacing="0">
          <Text fontWeight="bold" fontSize={{ base: "sm", md: "lg" }}>
            {controller}
          </Text>
          <Text
            fontSize={"sm"}
            color={
              colorMode === "light" ? lightGrayTextColor : darkGrayTextColor
            }
            noOfLines={1}
          >
            Controller
          </Text>
        </VStack>
      </Flex>
      <Divider />
      {vectors.map((vector, index) => (
        <VectorPreview key={index} controller={controller} vector={vector} />
      ))}
    </Flex>
  );
};

export default ControllerOverview;
