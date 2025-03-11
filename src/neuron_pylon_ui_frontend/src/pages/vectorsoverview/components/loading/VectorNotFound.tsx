import { Header } from "@/components";
import {
  Breadcrumb,
  Flex,
  Heading,
  IconButton,
  Text,
  Highlight,
} from "@chakra-ui/react";
import { BiArrowBack } from "react-icons/bi";
import { NavLink, useLocation } from "react-router-dom";

const VectorNotFound = ({ id }: { id: string | undefined }) => {
  const location = useLocation();

  return (
    <Header>
      {/* Back button and breadcrumb */}
      <Flex gap={3} mb={3} align="center">
        <NavLink
          to={
            location.state?.from
              ? `/vectors/${location.state.from}`
              : "/vectors"
          }
        >
          <IconButton
            aria-label="Back button"
            variant="surface"
            rounded="md"
            boxShadow="xs"
            size="xs"
          >
            <BiArrowBack />
          </IconButton>
        </NavLink>
        <Breadcrumb.Root size="lg">
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <NavLink
                to={
                  location.state?.from
                    ? `/vectors${location.state.from}`
                    : "/vectors"
                }
              >
                Vectors
              </NavLink>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.CurrentLink>Vector Not Found</Breadcrumb.CurrentLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </Flex>

      {/* Vector not found message */}
      <Flex
        bg="bg.subtle"
        boxShadow={"md"}
        borderRadius={"md"}
        direction={"column"}
        w="100%"
        p={6}
        gap={3}
        align="start"
      >
        <Heading
          letterSpacing="tight"
          size={{ base: "xl", md: "2xl" }}
          lineClamp={1}
        >
          <Highlight
            query={"Not Found"}
            styles={{
              px: "1",
              py: "1",
              color: "blue.fg",
            }}
          >
            Vector Not Found
          </Highlight>
        </Heading>
        <Text
          fontSize="sm"
          fontWeight={500}
          color="fg.muted"
          textTransform={"uppercase"}
        >
          The requested vector with ID #{id} could not be found.
        </Text>
      </Flex>
    </Header>
  );
};

export default VectorNotFound;
