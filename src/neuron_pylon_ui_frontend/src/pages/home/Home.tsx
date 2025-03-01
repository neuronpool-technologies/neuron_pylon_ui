import { Heading, Highlight, Flex } from "@chakra-ui/react";
import Search from "./Search";
import { Header } from "@/components";
import Stats from "./Stats";
import RecentVectors from "./RecentVectors";
import RecentActivity from "./RecentActivity";

const Home = () => {
  return (
    <Header>
      <Heading letterSpacing="tight" mb={3} size={{ base: "xl", md: "2xl" }}>
        <Highlight
          query="NeuronPool Vectors"
          styles={{
            px: "1",
            py: "1",
            color: "blue.fg",
          }}
        >
          Explore NeuronPool Vectors
        </Highlight>
      </Heading>
      <Search />
      <Stats />
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={{ base: 0, md: 3 }}
        w="100%"
      >
        <RecentVectors />
        <RecentActivity />
      </Flex>
    </Header>
  );
};

export default Home;
