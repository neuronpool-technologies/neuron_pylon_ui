import React from "react";
import { Box, useColorMode, Flex } from "@chakra-ui/react";
import { Shared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import {
  convertNanosecondsToElapsedTime,
  convertSecondsToFormattedDate,
  daysToMonthsAndYears,
  e8sToIcp,
} from "@/tools/conversions";
import { LabelBox } from "@/components";

type NeuronProps = {
  module: Shared;
};

const VariablesAndCache = ({ module }: NeuronProps) => {
  const dissolveDelaySeconds =
    module.devefi_jes1_icpneuron.cache.dissolve_delay_seconds[0];

  const dissolveDelay = daysToMonthsAndYears(
    Number(dissolveDelaySeconds) / (60 * 60 * 24)
  );

  const votingPower = Math.round(
    e8sToIcp(
      Number(module.devefi_jes1_icpneuron.cache.deciding_voting_power[0])
    )
  ).toLocaleString();

  const votingPowerRefreshed = convertSecondsToFormattedDate(
    Number(
      module.devefi_jes1_icpneuron.cache
        .voting_power_refreshed_timestamp_seconds
    )
  );

  const neuronStake = `${e8sToIcp(
    Number(module.devefi_jes1_icpneuron.cache.cached_neuron_stake_e8s[0])
  ).toFixed(4)} ICP`;

  const created = convertSecondsToFormattedDate(
    Number(module.devefi_jes1_icpneuron.cache.created_timestamp_seconds[0])
  );

  const maturity = `${e8sToIcp(
    Number(module.devefi_jes1_icpneuron.cache.maturity_e8s_equivalent[0])
  ).toFixed(4)} ICP`;

  let lastUpdated: string;
  if ("Init" in module.devefi_jes1_icpneuron.internals.updating) {
    lastUpdated = "Init";
  } else if ("Calling" in module.devefi_jes1_icpneuron.internals.updating) {
    lastUpdated = "Updating";
  } else {
    lastUpdated = convertNanosecondsToElapsedTime(
      Number(module.devefi_jes1_icpneuron.internals.updating.Done)
    );
  }

  let neuronStatus: string;
  if (module.devefi_jes1_icpneuron.cache.state[0] === 1) {
    neuronStatus = "Locked";
  } else if (module.devefi_jes1_icpneuron.cache.state[0] === 3) {
    neuronStatus = "Unlocked";
  } else {
    neuronStatus = "Dissolving";
  }

  let followeeId: string;
  if ("Default" in module.devefi_jes1_icpneuron.variables.followee) {
    followeeId = "6914974521667616512";
  } else {
    followeeId =
      module.devefi_jes1_icpneuron.variables.followee.FolloweeId.toString();
  }
  return (
    <Box>
      <Flex direction="column" w="100%" gap={3}>
        <Flex align="center" gap={3} direction={"row"}>
          <LabelBox label="Staked" data={neuronStake} />
          <LabelBox label="Available maturity" data={maturity} />
        </Flex>
        <Flex align="center" gap={3} direction={"row"}>
          <LabelBox label="Dissolve Delay" data={dissolveDelay} />
          <LabelBox label="Neuron Status" data={neuronStatus} />
        </Flex>
        <LabelBox label="Followee" data={followeeId} />
        {/* <Flex align="center" gap={3} direction={"row"}>
          <LabelBox label="Voting power (VP)" data={votingPower} />
          <LabelBox label="VP refreshed" data={votingPowerRefreshed} />
        </Flex> */}
        <Flex align="center" gap={3} direction={"row"}>
          <LabelBox label="Created" data={created} />
          <LabelBox label="Last updated" data={lastUpdated} />
        </Flex>
      </Flex>
    </Box>
  );
};

export default VariablesAndCache;
