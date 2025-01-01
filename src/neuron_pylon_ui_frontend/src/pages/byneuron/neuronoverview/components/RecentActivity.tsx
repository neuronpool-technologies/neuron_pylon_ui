import React from "react";
import {
  useColorMode,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import {
  lightBorderColor,
  darkBorderColor,
  lightGrayTextColor,
  darkGrayTextColor,
} from "@/colors";
import {
  Shared,
  Activity,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { convertNanoToFormattedDate } from "@/tools/conversions";

type RecentActivityProps = {
  module: Shared;
};

const RecentActivity = ({ module }: RecentActivityProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const logs = module.devefi_jes1_icpneuron.log.reverse();

  return (
    <TableContainer
      w="100%"
      h="100%"
      border={
        colorMode === "light"
          ? `solid ${lightBorderColor} 1px`
          : `solid ${darkBorderColor} 1px`
      }
      borderRadius="md"
      p={3}
    >
      <Table variant="unstyled">
        <Thead>
          <Tr>
            <Th
              px={3}
              color={
                colorMode === "light" ? lightGrayTextColor : darkGrayTextColor
              }
              fontWeight={500}
              fontSize="md"
              textTransform="none"
              letterSpacing="none"
              textAlign="start"
            >
              Timestamp
            </Th>
            <Th
              px={3}
              color={
                colorMode === "light" ? lightGrayTextColor : darkGrayTextColor
              }
              fontWeight={500}
              fontSize="md"
              textTransform="none"
              letterSpacing="none"
              textAlign="start"
            >
              Activity
            </Th>
            <Th
              px={3}
              color={
                colorMode === "light" ? lightGrayTextColor : darkGrayTextColor
              }
              fontWeight={500}
              fontSize="md"
              textTransform="none"
              letterSpacing="none"
              textAlign="end"
            >
              Result
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {logs.map((activity, index) => {
            return <ActivityBox key={index} activity={activity} />;
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default RecentActivity;

type ActivityBoxProps = {
  activity: Activity;
};

const ActivityBox = ({ activity }: ActivityBoxProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  if ("Err" in activity) {
    return (
      <Tr
        fontWeight={500}
        borderTop={
          colorMode === "light" ? `solid #edf2f5 1px` : `solid #414951 1px`
        }
      >
        <Td px={3} textAlign="start">
          {convertNanoToFormattedDate(Number(activity.Err.timestamp))}
        </Td>
        <Td px={3} textAlign="start">
          {activity.Err.operation}
        </Td>
        <Td px={3} textAlign="end">
          <WarningIcon color="red.500" />
        </Td>
      </Tr>
    );
  } else {
    return (
      <Tr
        fontWeight={500}
        borderTop={
          colorMode === "light" ? `solid #edf2f5 1px` : `solid #414951 1px`
        }
      >
        <Td px={3} textAlign="start">
          {convertNanoToFormattedDate(Number(activity.Ok.timestamp))}
        </Td>
        <Td px={3} textAlign="start">
          {activity.Ok.operation}
        </Td>
        <Td px={3} textAlign="end">
          <CheckCircleIcon color="green.500" />
        </Td>
      </Tr>
    );
  }
};
