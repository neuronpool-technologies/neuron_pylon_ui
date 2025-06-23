import { Flex, Heading, Separator } from "@chakra-ui/react";
import { NodeShared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { useTypedSelector } from "@/hooks/useRedux";
import { endpointToBalanceAndAccount } from "@/utils/AccountTools";
import { match, P } from "ts-pattern";
import { decodeRecord } from "@/utils/ChronoTools";
import { ChronoRecord } from "@/chrono/declarations/chrono_records/chrono_records.did";

const Transactions = ({ vector }: { vector: NodeShared }) => {
  const { chrono_log } = useTypedSelector((state) => state.Vectors);

  const sourceTx = chrono_log?.find(
    (tx) =>
      tx[0] === `/a/${endpointToBalanceAndAccount(vector.sources[0]).account}`
  );
  if (!sourceTx) return null;

  const sourceTxRecord : ChronoRecord[] = [];

  match(sourceTx[1]).with({ CANDID: P.select() }, (CANDID) => {
    for (let [timestamp, value] of CANDID) {
      // need to check how the timestamp is encoded and add it here too
      const decodedValue = decodeRecord(value as Uint8Array);
      sourceTxRecord.push(decodedValue);
    }
  });

  // TODO get the logs for the source 0 and source 1, source 1 is for neurons only
  if (vector.sources.length % 2 === 0) {
  }

  return (
    <Flex
      bg="bg.subtle"
      boxShadow={"md"}
      mt={6}
      borderRadius={"md"}
      direction={"column"}
      w="100%"
    >
      <Heading p={3}>Transactions</Heading>
      <Separator />
      <Flex direction="column" w="100%" h="100%">
        {/* {logToShow.length > 0 ? (
          logToShow.map((log, index) => (
            <VectorLog
              key={index}
              vector={vector}
              activity={log}
              first={index === 0}
              showLink={false}
            />
          )) */}
        {/* ) : ( */}
        <Flex
          align="center"
          justify={"center"}
          fontWeight={500}
          my={12}
          h="100%"
          fontSize="md"
        >
          No transactions found...
        </Flex>
        {/* )} */}
      </Flex>
    </Flex>
  );
};

export default Transactions;
