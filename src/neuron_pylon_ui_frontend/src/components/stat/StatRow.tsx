import { Flex, Text, Spacer } from "@chakra-ui/react";

type StatRowProps = {
  title: string;
  stat?: string | React.ReactNode;
  children?: React.ReactNode;
};

const StatRow = ({ title, stat, children }: StatRowProps) => {
  return (
    <Flex w="100%" gap={1} align="center">
      <Text lineClamp={1} fontWeight={500}>
        {title}
      </Text>
      {children}
      <Spacer />
      <Flex lineClamp={1} fontWeight={500}>
        {stat}
      </Flex>
    </Flex>
  );
};

export default StatRow;
