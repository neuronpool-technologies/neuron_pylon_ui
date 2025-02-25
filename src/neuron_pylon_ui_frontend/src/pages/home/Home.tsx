import { Heading, Highlight } from "@chakra-ui/react";
import Search from "./Search";
import { Header } from "@/components";
import Stats from "./Stats";

const Home = () => {
  return (
    <Header>
      <Heading letterSpacing="tight" mb={3}>
        <Highlight
          query="NeuronPool Vectors"
          styles={{
            px: "1",
            py: "1",
            color: "blue.solid",
          }}
        >
          Explore NeuronPool Vectors
        </Highlight>
      </Heading>
      <Search />
      <Stats />
    </Header>
  );
};

export default Home;
