import { StatIcon } from "@/components";
import { useTypedSelector } from "@/hooks/useRedux";
import { Flex, Text, Separator, Skeleton } from "@chakra-ui/react";
import { BiLock, BiRefresh, BiDollar, BiUser } from "react-icons/bi";
import { match, P } from "ts-pattern";
import { Shared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { e8sToIcp } from "@/utils/TokenTools";

const Stats = () => {
  const { vectors } = useTypedSelector((state) => state.Vectors);
  const { prices } = useTypedSelector((state) => state.Meta);
  const tokenRate = prices?.find((price) => price.symbol === "ICP");

  const calculatedStats = vectors.reduce(
    (acc, node) => {
      // Skip nodes with an empty node[0]
      if (!node) return acc;

      // Extract the controller and convert its owner to a string using toString()
      const controller = node.controllers[0];
      const ownerId = controller.owner.toString();
      acc.uniqueOwners.add(ownerId);

      const { custom } = node;

      const icpNeuron = match(custom?.[0] as Shared)
        .with(
          { devefi_jes1_icpneuron: P.not(P.nullish) },
          ({ devefi_jes1_icpneuron }) => devefi_jes1_icpneuron
        )
        .otherwise(() => undefined);

      const cache = icpNeuron?.cache;

      // Increment totalVectors if node[0] is defined
      const hasVector = 1;

      // Calculate totalStake
      const stake = Number(cache?.cached_neuron_stake_e8s?.[0] || 0);

      return {
        totalVectors: acc.totalVectors + hasVector,
        totalStake: acc.totalStake + stake,
        uniqueOwners: acc.uniqueOwners,
      };
    },
    {
      totalVectors: 0,
      totalStake: 0,
      uniqueOwners: new Set<string>(),
    }
  );

  const stats = {
    total_icp_staked: Math.round(e8sToIcp(Number(calculatedStats.totalStake))),
    total_vectors: calculatedStats.totalVectors.toLocaleString(),
    total_controllers: calculatedStats.uniqueOwners.size.toLocaleString(),
  };

  const tvl =
    stats?.total_icp_staked !== undefined &&
    Number(stats?.total_icp_staked) > 0 &&
    tokenRate
      ? `$${(
          Number(stats?.total_icp_staked) * tokenRate.last_price
        ).toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`
      : null;

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
      <Separator orientation="vertical" my={3} hideBelow={"md"} />
      <Separator mx={3} hideFrom={"md"} />
      <Flex direction={"column"} p={3} w="100%" gap={3}>
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
