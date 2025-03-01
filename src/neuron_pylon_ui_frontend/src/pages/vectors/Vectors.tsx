import { Heading, Highlight, Text } from "@chakra-ui/react";
import { Header } from "@/components";
import VectorsTable from "./VectorsTable";

const Vectors = () => {
  return (
    <Header>
      <Heading letterSpacing="tight" mb={3} size={{ base: "xl", md: "2xl" }}>
        <Highlight
          query="Vectors"
          styles={{
            px: "1",
            py: "1",
            color: "blue.fg",
          }}
        >
          NeuronPool Vectors
        </Highlight>
      </Heading>
      <Text fontSize="md" color="fg.muted" fontWeight={500}>
        Stake neurons and receive maturity directly to your destination
      </Text>
      <VectorsTable />
    </Header>
  );
};

export default Vectors;
