import React from "react";
import { useColorMode, Flex, Text } from "@chakra-ui/react";
import { lightGrayTextColor, darkGrayTextColor } from "@/colors";
import { useTypedSelector } from "@/hooks/hooks";
import { LoadingBox, VectorPreview } from "@/components";

const YourVectors = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { principal, vectors, status } = useTypedSelector(
    (state) => state.Profile
  );
  return (
    <>
      {vectors.length > 0 ? (
        <Flex w="100%" direction="column" gap={3}>
          {vectors.map((vector, index) => (
            <VectorPreview key={index} controller={principal} vector={vector} />
          ))}
        </Flex>
      ) : null}
      {status === "loading" ? <LoadingBox /> : null}
      {status !== "loading" && !vectors.length ? (
        <Flex
          w="100%"
          align="center"
          justify="center"
          h="200px"
          direction="column"
        >
          <Text
            size="sm"
            color={
              colorMode === "light" ? lightGrayTextColor : darkGrayTextColor
            }
          >
            No vectors detected.
          </Text>
        </Flex>
      ) : null}
    </>
  );
};

export default YourVectors;
