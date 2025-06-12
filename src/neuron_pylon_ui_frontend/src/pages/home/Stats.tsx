import { StatIcon } from "@/components";
import { useTypedSelector } from "@/hooks/useRedux";
import { Flex, Text, Separator, Skeleton } from "@chakra-ui/react";
import { BiLock, BiRefresh, BiPlusCircle, BiUser } from "react-icons/bi";

const Stats = () => {
  const { stats } = useTypedSelector((state) => state.Vectors);
  return (
    <Flex
      bg="bg.subtle"
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
          ready={stats ? true : false}
        />
        <Separator />
        <StatBox
          title="Total maturity"
          value={`${stats?.total_icp_maturity} ICP`}
          icon={<BiPlusCircle />}
          ready={stats ? true : false}
        />
      </Flex>
      <Separator orientation="vertical" my={3} hideBelow={"md"} />
      <Separator mx={3} hideFrom={"md"} />
      <Flex direction={"column"} p={3} w="100%" gap={3}>
        <StatBox
          title="total vectors"
          value={`${stats?.total_vectors}`}
          icon={<BiRefresh />}
          ready={stats ? true : false}
        />
        <Separator />
        <StatBox
          title="Unique owners"
          value={`${stats?.total_controllers}`}
          icon={<BiUser />}
          ready={stats ? true : false}
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
  ready,
}: {
  title: string;
  value: string;
  icon: React.ReactElement;
  ready: boolean;
}) => {
  return (
    <Flex align="center" gap={3}>
      <StatIcon>{icon}</StatIcon>
      <Flex direction="column" gap={0}>
        <Text
          fontSize="sm"
          fontWeight={500}
          color="fg.muted"
          textTransform={"uppercase"}
        >
          {title}
        </Text>
        <Skeleton height="5" loading={!ready}>
          <Text fontWeight={500} fontSize="md">
            {value}
          </Text>
        </Skeleton>
      </Flex>
    </Flex>
  );
};
