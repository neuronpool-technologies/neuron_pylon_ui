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
  const logToShow = vectorLog.slice(0, 5).reverse();
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
      <Flex direction="column" w="100%">
        {logToShow.map((log, index) => (
          <VectorLog
            key={index}
            vector={vector}
            activity={log}
            first={index === 0}
            showLink={false}
          />
        ))}
      </Flex>
    </Flex>
  );
};

export default Activity;
