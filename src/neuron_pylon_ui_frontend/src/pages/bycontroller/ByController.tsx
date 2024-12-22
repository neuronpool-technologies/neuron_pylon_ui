import React from "react";
import {
  Box,
  Heading,
  Divider,
  VStack,
  useColorMode,
  Flex,
  Spacer,
  IconButton,
  Container,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import { ArrowBackIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  darkColorBox,
  lightColorBox,
  lightBorderColor,
  darkBorderColor,
} from "@/colors";
import { useParams, NavLink } from "react-router-dom";

const ByController = () => {
  const { id, controller } = useParams();
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Container maxW="xl" my={5}>
      <Flex align="center" mb={3}>
        <NavLink to={`/`}>
          <IconButton
            aria-label="go back"
            icon={<ArrowBackIcon />}
            rounded="full"
            boxShadow="base"
          />
        </NavLink>
        <Spacer />
        <Breadcrumb
          spacing={{ base: 0.5, md: "8px" }}
          separator={<ChevronRightIcon boxSize={5} color={darkBorderColor} />}
        >
          <BreadcrumbItem _hover={{ textDecoration: "underline" }}>
            <NavLink to="/">Vectors</NavLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Controller</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </Flex>
      <Box
        boxShadow="md"
        borderRadius="lg"
        p={3}
        border={
          colorMode === "light"
            ? `solid ${lightBorderColor} 1px`
            : `solid ${darkBorderColor} 1px`
        }
        bg={colorMode === "light" ? lightColorBox : darkColorBox}
      >
        <Flex align="center" mb={3}>
          <Heading size={"md"} noOfLines={1}>
            Controller
          </Heading>
        </Flex>
        <VStack spacing={3} align="start">
          <Divider />
        </VStack>
      </Box>
    </Container>
  );
};

export default ByController;
