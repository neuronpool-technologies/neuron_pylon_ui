import { Flex, Box, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useColorMode } from "@/components/ui/color-mode";

type StatBoxProps = {
  title: string;
  value: string;
  animation?: boolean;
};

const StatBox = ({ title, value, animation }: StatBoxProps) => {
  const { toggleColorMode, colorMode } = useColorMode();
  
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
      <Flex color="fg.muted" ml="30px" mb="-10px">
        <Text
          bg={colorMode === "light" ? "bg" : "bg.subtle"}
          fontSize="xs"
          display="inline-flex"
          px={2}
          lineClamp={1}
        >
          {title}
        </Text>
      </Flex>

      <Flex
        gap="1"
        border="1px dashed"
        fontSize="sm"
        borderColor="border.emphasized"
        p={3}
        alignItems="center"
        borderRadius="8px"
        animation={animation ? `${pulseAnimation} 1s infinite` : ""}
      >
        <Text lineClamp={1}>{value}</Text>
      </Flex>
    </Box>
  );
};

export default StatBox;
