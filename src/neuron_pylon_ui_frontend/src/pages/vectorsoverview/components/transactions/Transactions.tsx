import { Flex, Heading, Separator, Text } from "@chakra-ui/react";
import { NodeShared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { useTypedSelector } from "@/hooks/useRedux";
import { VectorTransaction } from "@/components";
import { processChronoLogTransactions } from "@/utils/ChronoTools";
import { SearchResp } from "@/chrono/declarations/chrono_slice/chrono_slice.did";
import { NavLink } from "react-router-dom";
import { BiRightArrowAlt } from "react-icons/bi";
import { extractNodeType } from "@/utils/Node";

const Transactions = ({ vector }: { vector: NodeShared }) => {
  const { chrono_log } = useTypedSelector((state) => state.Vectors);
  const { meta } = useTypedSelector((state) => state.Meta);
  if (!meta) return null;

  // Filter chrono_log to only include transactions for this vector
  const filteredTransactions: SearchResp = processChronoLogTransactions(
    chrono_log,
    {
      vectorId: vector.id,
      limit: 6,
    }
  );
  const { controller } = extractNodeType(vector, meta);

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
        {filteredTransactions.map((transactions, index) => (
          <VectorTransaction
            transactions={transactions}
            key={index}
            first={index === 0}
            showLink
          />
        ))}
        {filteredTransactions.length === 0 && (
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
        )}
      </Flex>
      {filteredTransactions.length > 0 ? (
        <NavLink to={`/vectors/${controller}/${vector.id}/transactions`}>
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
              view all
            </Text>
            <BiRightArrowAlt />
          </Flex>
        </NavLink>
      ) : (
        <Flex
          borderTop={"1px solid"}
          borderColor={"bg.emphasized"}
          borderBottomRadius={"md"}
          bg="bg.muted"
          p={3}
          align="center"
          justify={"center"}
          gap={1}
          color="fg.subtle"
          opacity={0.6}
        >
          <Text fontSize="sm" fontWeight={500} textTransform={"uppercase"}>
            view all
          </Text>
          <BiRightArrowAlt />
        </Flex>
      )}
    </Flex>
  );
};

export default Transactions;
