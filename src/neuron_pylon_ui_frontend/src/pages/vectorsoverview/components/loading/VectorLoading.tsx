import { Header } from "@/components";
import { SkeletonCircle, SkeletonText } from "@/components/ui/skeleton";
import { Flex, Separator, Skeleton } from "@chakra-ui/react";

const VectorLoading = () => {
  return (
    <Header>
      {/* Back button and breadcrumb skeleton */}
      <Flex gap={3} mb={3} align="center">
        <Skeleton height="34px" width="34px" rounded="md" />
        <SkeletonText width="150px" noOfLines={1} />
      </Flex>

      {/* Vector info card skeleton */}
      <Flex
        bg="bg.subtle"
        boxShadow={"md"}
        borderRadius={"md"}
        direction={"column"}
        w="100%"
        p={3}
        gap={3}
      >
        <Flex align="center" gap={3}>
          <SkeletonCircle size="45px" />
          <Skeleton height="40px" width="250px" />
        </Flex>
        <SkeletonText width="300px" noOfLines={1} mb={3} />
        <Flex gap={3} direction={{ base: "column", md: "row" }}>
          <Skeleton height="30px" width="250px" />
          <Flex align="center" gap={3}>
            <Skeleton height="30px" width="100px" />
            <Skeleton height="30px" width="100px" />
          </Flex>
        </Flex>
      </Flex>

      {/* Tabs section skeleton */}
      <Flex
        bg="bg.subtle"
        boxShadow={"md"}
        mt={6}
        borderRadius={"md"}
        direction={"column"}
        w="100%"
        p={3}
      >
        <Skeleton height="40px" width="300px" mb={4} />
        <SkeletonText mt="4" noOfLines={5} gap="4" />
      </Flex>
      {/* About section skeleton */}
      <Flex
        bg="bg.subtle"
        boxShadow={"md"}
        mt={6}
        borderRadius={"md"}
        direction={"column"}
        w="100%"
        p={3}
      >
        <Skeleton height="40px" width="100px" mb={3} />
        <Separator />
        <SkeletonText mt="4" noOfLines={7} gap="4" />
      </Flex>
      {/* Transactions section skeleton */}
      <Flex
        bg="bg.subtle"
        boxShadow={"md"}
        mt={6}
        borderRadius={"md"}
        direction={"column"}
        w="100%"
        p={3}
      >
        <Skeleton height="40px" width="100px" mb={3} />
        <Separator />
        <SkeletonText mt="4" noOfLines={7} gap="4" />
      </Flex>
    </Header>
  );
};

export default VectorLoading;
