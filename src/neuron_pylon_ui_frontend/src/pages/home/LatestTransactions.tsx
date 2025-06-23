import { useTypedSelector } from "@/hooks/useRedux";
import { Flex, Heading, Separator, Text, Box } from "@chakra-ui/react";
import { VectorTransaction } from "@/components";
import { BiRightArrowAlt } from "react-icons/bi";
import { NavLink } from "react-router-dom";
import { processChronoLogTransactions } from "@/utils/ChronoTools";

const LatestTransactions = () => {
  const { chrono_log } = useTypedSelector((state) => state.Vectors);

  const latest_transactions = processChronoLogTransactions(chrono_log, {
    limit: 6,
  });

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
        {latest_transactions.map((transactions, index) => (
          <VectorTransaction
            transactions={transactions}
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
