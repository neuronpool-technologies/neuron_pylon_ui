import { useTypedSelector } from "@/hooks/useRedux";
import {
  Flex,
  Text,
  Separator,
  SkeletonCircle,
  SkeletonText,
  Icon,
} from "@chakra-ui/react";
import { BiLock, BiRefresh, BiDollar, BiUser } from "react-icons/bi";
import { computeUsdValueOfNodes, extractNodeType } from "@/utils/Node";

const Stats = () => {
  const { vectors } = useTypedSelector((state) => state.Vectors);
  const { meta, prices } = useTypedSelector((state) => state.Meta);

  const calculatedStats = vectors.reduce(
    (acc, node) => {
      if (!node) return acc;

      // Add owner to unique owners set
      const ownerId = node.controllers[0].owner.toString();
      acc.uniqueOwners.add(ownerId);

      if (meta) {
        const { symbol, type, amount } = extractNodeType(node, meta);

        // Update staked amounts for Neurons
        if (type === "Neuron") {
          const amountNum = Number(amount);

          // Increment the appropriate token counter based on symbol
          if (symbol === "ICP") acc.totalIcpStaked += amountNum;
        }
      }

      // Increment total vectors
      acc.totalVectors++;

      return acc;
    },
    {
      totalVectors: 0,
      totalIcpStaked: 0,
      totalNtnStaked: 0,
      totalKongStaked: 0,
      uniqueOwners: new Set<string>(),
    }
  );

  const stats = {
    total_icp_staked: Math.round(calculatedStats.totalIcpStaked),
    total_vectors: calculatedStats.totalVectors.toLocaleString(),
    total_controllers: calculatedStats.uniqueOwners.size.toLocaleString(),
  };

  const tvl = computeUsdValueOfNodes({
    nodes: vectors,
    prices: prices,
    meta: meta,
    decimals: 0,
  });

  return (
    <Flex
      bg="bg.subtle"
      boxShadow={"md"}
      mt={8}
      borderRadius={"md"}
      direction={{ base: "column", md: "row" }}
    >
      <Flex direction={"column"} w="100%">
        <StatBox
          title="icp staked"
          value={`${stats?.total_icp_staked.toLocaleString()} ICP`}
          icon={<BiLock />}
          ready={stats && tvl ? true : false}
        />
        <Separator />
        <StatBox
          title="total value"
          value={`${tvl}`}
          icon={<BiDollar />}
          ready={stats && tvl ? true : false}
        />
      </Flex>
      <Separator orientation="vertical" hideBelow={"md"} />
      <Separator hideFrom={"md"} />
      <Flex direction={"column"} w="100%">
        <StatBox
          title="total vectors"
          value={`${stats?.total_vectors}`}
          icon={<BiRefresh />}
          ready={stats && tvl ? true : false}
        />
        <Separator />
        <StatBox
          title="Unique owners"
          value={`${stats?.total_controllers}`}
          icon={<BiUser />}
          ready={stats && tvl ? true : false}
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
  return ready ? (
    <Flex align="center" gap={3} p={3}>
      <Icon fontSize={45} p={2.5} bg={"bg.emphasized"} borderRadius="full">
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
        <Text fontWeight={500} fontSize="md">
          {value}
        </Text>
      </Flex>
    </Flex>
  ) : (
    <Flex align="center" gap={3} p={3}>
      <SkeletonCircle size="45px" />
      <Flex direction="column" gap={2}>
        <SkeletonText width="100px" noOfLines={1} />
        <SkeletonText width="100px" noOfLines={1} />
      </Flex>
    </Flex>
  );
};
