import { Flex, Box, Text, Spinner } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

type StatBoxProps = {
  title: string;
  value?: string;
  animation?: boolean;
  bg: string;
  fontSize?: string;
  children?: React.ReactNode;
};

const StatBox = ({
  title,
  value,
  animation,
  bg,
  fontSize,
  children,
}: StatBoxProps) => {
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
    <Box w="100%" bg="inherit">
      <Flex color="fg.muted" ml="10px" mb="-10px" bg="inherit">
        <Text bg={bg} fontSize="xs" display="inline-flex" px={2} lineClamp={1}>
          {animation ? <Spinner size="inherit" /> : title}
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
        transition={"all 0.2s"}
        animation={animation ? `${pulseAnimation} 1s infinite` : ""}
      >
        {children ? (
          children
        ) : (
          <Text lineClamp={1} fontSize={fontSize} fontWeight={500}>
            {value}
          </Text>
        )}
      </Flex>
    </Box>
  );
};

export default StatBox;
