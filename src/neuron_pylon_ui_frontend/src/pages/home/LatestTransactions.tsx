import { useTypedSelector } from "@/hooks/useRedux";
import { Flex, Heading, Separator, Text, Box } from "@chakra-ui/react";
import { VectorTransaction } from "@/components";
import { BiRightArrowAlt } from "react-icons/bi";
import { NavLink } from "react-router-dom";
import { chronoIdToTsid } from "@/utils/ChronoTools";
import { match, P } from "ts-pattern";
import { SearchResp } from "@/chrono/declarations/chrono_slice/chrono_slice.did";

const LatestTransactions = () => {
  const { chrono_log } = useTypedSelector((state) => state.Vectors);

  // Extract and flatten all entries with timestamps
  const allEntries: any[] = [];

  chrono_log.forEach((tx) => {
    match(tx[1])
      .with({ CANDID: P.select() }, (CANDID) => {
        CANDID.forEach(([chronoId, value]) => {
          const [timestamp] = chronoIdToTsid(chronoId);
          allEntries.push({
            txId: tx[0],
            chronoId,
            value,
            timestamp,
            vectorId: "vectorId" in tx[1] ? (tx[1].vectorId as number) : 0,
          });
        });
      })
      .otherwise(() => {});
  });

  // Sort by timestamp and take top 6
  const latestEntries = allEntries
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6);

  // Group by txId to reconstruct the format
  const txMap = new Map();

  latestEntries.forEach(
    ({ txId, chronoId, value, vectorId }) => {
      if (!txMap.has(txId)) {
        txMap.set(txId, { txId, CANDID: [], vectorId });
      }
      txMap.get(txId).CANDID.push([chronoId, value]);
    }
  );

  // Create final result
  const latest_transactions: SearchResp = Array.from(txMap.values()).map(
    ({ txId, CANDID, vectorId }) => [
      txId,
      { CANDID, vectorId },
    ]
  );

  return (
    <Flex
      bg="bg.subtle"
      boxShadow={"md"}
      mt={8}
      borderRadius={"md"}
      direction={"column"}
      w="100%"
    >
      <Heading p={3}>Latest Transactions</Heading>
      <Separator />
      <Flex direction="column" w="100%">
        {latest_transactions.map((transaction, index) => (
          <VectorTransaction
            transaction={transaction}
            key={index}
            first={index === 0}
            showLink
          />
        ))}
      </Flex>
      <NavLink to={`/vectors`}>
        <Flex
          borderTop={"1px solid"}
          borderColor={"bg.emphasized"}
          borderBottomRadius={"md"}
          bg="bg.muted"
          p={3}
          align="center"
          justify={"center"}
          transition={"all 0.2s"}
          _hover={{
            cursor: "pointer",
            color: "blue.fg",
          }}
          gap={1}
          color="fg.muted"
        >
          <Text fontSize="sm" fontWeight={500} textTransform={"uppercase"}>
            view vectors
          </Text>
          <BiRightArrowAlt />
        </Flex>
      </NavLink>
    </Flex>
  );
};

export default LatestTransactions;
