import React from "react";
import { useColorMode, Flex, Text, Button } from "@chakra-ui/react";
import { lightGrayTextColor, darkGrayTextColor } from "@/colors";
import { useTypedDispatch, useTypedSelector } from "@/hooks/hooks";
import { Auth, VectorPreview } from "@/components";
import { fetchWallet } from "@/state/ProfileSlice";

const YourVectors = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { principal, logged_in, vectors, status } = useTypedSelector(
    (state) => state.Profile
  );

  const dispatch = useTypedDispatch();

  const fetchProfile = async () => {
    dispatch(fetchWallet({ principal }));
  };

  return (
    <>
      {vectors.length > 0 ? (
        <Flex w="100%" direction="column" gap={3}>
          {vectors.map((vector, index) => (
            <VectorPreview key={index} controller={principal} vector={vector} />
          ))}
        </Flex>
      ) : null}
      {!vectors.length ? (
        <Flex
          w="100%"
          align="center"
          justify="center"
          h="150px"
          direction="column"
        >
          <Text
            size="sm"
            color={
              colorMode === "light" ? lightGrayTextColor : darkGrayTextColor
            }
            fontWeight={500}
          >
            No vectors detected.
          </Text>
        </Flex>
      ) : null}
      {logged_in ? (
        <Button
          w="100%"
          rounded="full"
          boxShadow="base"
          isLoading={status === "loading"}
          onClick={fetchProfile}
        >
          Resync
        </Button>
      ) : (
        <Auth />
      )}
    </>
  );
};

export default YourVectors;
