import {
  Box,
  Button,
  Center,
  Heading,
  Highlight,
  Text,
  VStack,
  Image as ChakraImage,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components";
import mascot from "../../../assets/mascot.svg";
import { BiHome } from "react-icons/bi";

const Error = () => {
  const navigate = useNavigate();

  return (
    <Header>
      <Center py={4} px={4}>
        <VStack gap={4}>
          <Box maxW="300px" mx="auto">
            <ChakraImage src={mascot} alt="NeuronPool Mascot" width="100%" />
          </Box>

          <VStack gap={3} textAlign="center">
            <Heading size={{ base: "xl", md: "2xl" }} letterSpacing="tight">
              <Highlight
                query={"Page Not Found"}
                styles={{
                  px: "1",
                  py: "1",
                  color: "blue.fg",
                }}
              >
                Oops! Page Not Found
              </Highlight>
            </Heading>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="fg.muted"
              maxW="500px"
            >
              We couldn't find the page you're looking for. It might have been
              moved or doesn't exist.
            </Text>
          </VStack>

          <Button
            variant="surface"
            colorPalette={"gray"}
            rounded="md"
            boxShadow="xs"
            onClick={() => navigate("/")}
          >
            <BiHome /> Go Home
          </Button>
        </VStack>
      </Center>
    </Header>
  );
};

export default Error;
