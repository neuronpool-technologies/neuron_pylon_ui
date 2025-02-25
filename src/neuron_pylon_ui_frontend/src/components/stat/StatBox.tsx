import { Flex, Box, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

type StatBoxProps = {
  title: string;
  value: string;
  animation?: boolean;
};

const StatBox = ({ title, value, animation }: StatBoxProps) => {
  const pulseAnimation = keyframes`
    0% {
      border-color: #ccc;
    }
    50% {
      border-color: #888;
    }
    100% {
      border-color: #ccc;
    }
  `;

  return (
    <Box w="100%">
      <Flex color="fg.muted" ml="10px" mb="-10px">
        <Text
          bg={"bg.subtle"}
          fontSize="xs"
          display="inline-flex"
          px={2}
          lineClamp={1}
        >
          {title}
        </Text>
      </Flex>

      <Flex
        border="1px dashed"
        fontSize="sm"
        borderColor="border.emphasized"
        py={2}
        px={4}
        alignItems="center"
        borderRadius="md"
        animation={animation ? `${pulseAnimation} 1s infinite` : ""}
      >
        <Text lineClamp={1} fontSize="sm">
          {value}
        </Text>
      </Flex>
    </Box>
  );
};

export default StatBox;
