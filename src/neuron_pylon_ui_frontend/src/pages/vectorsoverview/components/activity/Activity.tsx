import { Flex, Heading, Separator } from "@chakra-ui/react";
import {
  NodeShared,
  Activity,
} from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { VectorLog } from "@/components";

const Activity = ({
  vectorLog,
  vector,
}: {
  vectorLog: Array<Activity>;
  vector: NodeShared;
}) => {
  const logToShow = [...vectorLog].reverse().slice(0, 5);
  return (
    <Flex
      bg="bg.subtle"
      boxShadow={"md"}
      mt={6}
      borderRadius={"md"}
      direction={"column"}
      w="100%"
    >
      <Heading p={3}>Recent Activity</Heading>
      <Separator />
      <Flex direction="column" w="100%" h="100%">
        {logToShow.length > 0 ? (
          logToShow.map((log, index) => (
            <VectorLog
              key={index}
              vector={vector}
              activity={log}
              first={index === 0}
              showLink={false}
            />
          ))
        ) : (
          <Flex
            align="center"
            justify={"center"}
            fontWeight={500}
            my={12}
            h="100%"
            fontSize="md"
          >
            No activity...
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default Activity;
