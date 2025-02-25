import { Flex, Text, Icon, Heading } from "@chakra-ui/react";
import { BiRefresh } from "react-icons/bi";
import {
  NodeShared,
  Shared,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import StatBox from "../stat/StatBox";
import { match, P } from "ts-pattern";
import { e8sToIcp } from "@/utils/TokenTools";
import { useTypedSelector } from "@/hooks/useRedux";
import { NavLink } from "react-router-dom";
import { accountToString } from "@/utils/AccountTools";

const VectorPreview = ({ vector }: { vector: NodeShared }) => {
  const { meta } = useTypedSelector((state) => state.Meta);
  const controller = accountToString(vector.controllers[0]);

  const { type, label, value } = match(vector.custom?.[0] as Shared)
    .with(
      { devefi_jes1_icpneuron: P.not(P.nullish) },
      ({ devefi_jes1_icpneuron }) => {
        return {
          type: "ICP Neuron",
          label: "Staked",
          value: `${Math.round(
            e8sToIcp(
              Number(devefi_jes1_icpneuron.cache?.cached_neuron_stake_e8s?.[0])
            )
          ).toLocaleString()} ICP`,
        };
      }
    )
    .with(
      { devefi_jes1_snsneuron: P.not(P.nullish) },
      ({ devefi_jes1_snsneuron }) => {
        const ledgerUsed =
          "ic" in vector.sources[0].endpoint
            ? vector.sources[0].endpoint.ic.ledger.toString()
            : "";

        const token = meta?.supported_ledgers.find((ledger) => {
          if (!("ic" in ledger?.ledger)) return false;
          return ledger?.ledger.ic.toString() === ledgerUsed;
        });

        return {
          type: "SNS Neuron",
          label: "Staked",
          value: `${Math.round(
            e8sToIcp(
              Number(
                devefi_jes1_snsneuron.neuron_cache[0]?.cached_neuron_stake_e8s
              )
            )
          ).toLocaleString()} ${token?.symbol}`,
        };
      }
    )
    .with({ devefi_split: P.not(P.nullish) }, ({ devefi_split }) => {
      const ledgerUsed =
        "ic" in vector.sources[0].endpoint
          ? vector.sources[0].endpoint.ic.ledger.toString()
          : "";

      const token = meta?.supported_ledgers.find((ledger) => {
        if (!("ic" in ledger?.ledger)) return false;
        return ledger?.ledger.ic.toString() === ledgerUsed;
      });
      return {
        type: "Splitter",
        label: "Split",
        value: `${token?.symbol}`,
      };
    })
    .exhaustive();

  return (
    <NavLink to={`/vectors/${controller}/${vector.id}`}>
      <Flex
        boxShadow={"sm"}
        borderRadius={"md"}
        p={3}
        direction={"row"}
        align="center"
        bg="bg.subtle"
        transition={"all 0.2s"}
        _hover={{
          cursor: "pointer",
          boxShadow: "md",
          transform: "translateX(5px)",
        }}
      >
        <Flex w={{ base: "65%", md: "80%" }} gap={3} align="center">
          <Icon fontSize={45} p={2} bg={"bg.muted"} borderRadius="full">
            <BiRefresh />
          </Icon>
          <Flex direction="column" gap={0}>
            <Heading fontSize="sm" lineClamp={1}>
              {type} #{vector.id}
            </Heading>
            <Text fontSize="sm" color="fg.muted" lineClamp={1}>
              2 days ago
            </Text>
          </Flex>
        </Flex>
        <Flex w={{ base: "35%", md: "20%" }}>
          <StatBox title={label} value={value} />
        </Flex>
      </Flex>
    </NavLink>
  );
};

export default VectorPreview;
