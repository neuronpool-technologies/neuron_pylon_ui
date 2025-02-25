import { useTypedSelector } from "@/hooks/useRedux";
import { Flex, Text, Separator, Icon, Skeleton } from "@chakra-ui/react";
import { BiLock, BiRefresh, BiPlusCircle, BiUser } from "react-icons/bi";

const Stats = () => {
  const { stats, status } = useTypedSelector((state) => state.Stats);

  return (
    <Flex
      bg="bg"
      boxShadow={"md"}
      mt={8}
      borderRadius={"md"}
      direction={{ base: "column", md: "row" }}
    >
      <Flex direction={"column"} p={3} w="100%" gap={3}>
        <StatBox
          title="total staked"
          value={`${stats?.total_icp_staked} ICP`}
          icon={<BiLock />}
          status={status}
        />
        <Separator />
        <StatBox
          title="spawning maturity"
          value={`${stats?.total_icp_maturity} ICP`}
          icon={<BiPlusCircle />}
          status={status}
        />
      </Flex>
      <Separator orientation="vertical" my={3} hideBelow={"md"} />
      <Separator mx={3} hideFrom={"md"}/>
      <Flex direction={"column"} p={3} w="100%" gap={3}>
        <StatBox
          title="total vectors"
          value={`${stats?.total_vectors}`}
          icon={<BiRefresh />}
          status={status}
        />
        <Separator />
        <StatBox
          title="Controllers"
          value={`${stats?.total_controllers}`}
          icon={<BiUser />}
          status={status}
        />
      </Flex>
    </Flex>
  );
};

export default Stats;

const StatBox = ({
  title,
  value,
  icon,
  status,
}: {
  title: string;
  value: string;
  icon: React.ReactElement;
  status: string;
}) => {
  return (
    <Flex align="center">
      <Icon mr={3} fontSize={45} p={2} bg={"bg.muted"} borderRadius="full">
        {icon}
      </Icon>
      <Flex direction="column" gap={0}>
        <Text
          fontSize="sm"
          fontWeight={500}
          color="fg.muted"
          textTransform={"uppercase"}
        >
          {title}
        </Text>
        <Skeleton height="5" loading={status !== "succeeded"}>
          <Text fontWeight={500} fontSize="md">
            {value}
          </Text>
        </Skeleton>
      </Flex>
    </Flex>
  );
};
