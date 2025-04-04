import { useTypedSelector } from "@/hooks/useRedux";
import { Flex, Heading, Separator, Text } from "@chakra-ui/react";
import { VectorPreview } from "@/components";
import { BiRightArrowAlt } from "react-icons/bi";
import { NavLink } from "react-router-dom";

const RecentVectors = () => {
  const { vectors } = useTypedSelector((state) => state.Vectors);
  const latestVectors = [...vectors].slice(0, 6);

  return (
    <Flex
      bg="bg.subtle"
      boxShadow={"md"}
      mt={8}
      borderRadius={"md"}
      direction={"column"}
      w="100%"
    >
      <Heading p={3}>Latest Vectors</Heading>
      <Separator />
      <Flex direction="column" w="100%">
        {latestVectors.map((vector, index) => (
          <VectorPreview key={index} vector={vector} first={index === 0} />
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
            view all
          </Text>
          <BiRightArrowAlt />
        </Flex>
      </NavLink>
    </Flex>
  );
};

export default RecentVectors;
