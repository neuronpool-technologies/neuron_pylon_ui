import { Header, VectorPreview } from "@/components";
import { useTypedSelector } from "@/hooks/useRedux";
import {
  Flex,
  Button,
  Separator,
  Spacer,
  Heading,
  Highlight,
  Text,
} from "@chakra-ui/react";
import {
  HiMiniArrowsUpDown,
  HiMiniArrowSmallDown,
  HiMiniArrowSmallUp,
  HiMiniXMark,
} from "react-icons/hi2";
import { useState, useMemo, useEffect } from "react";
import { computeUsdValueOfNodes, extractNodeType } from "@/utils/Node";
import { useParams, useNavigate } from "react-router-dom";
import CreateVector from "./CreateVector";

// Define sort types for better type safety
type SortField = "created" | "staked";
type SortDirection = "asc" | "desc";

const VectorsTable = () => {
  const { meta, prices } = useTypedSelector((state) => state.Meta);
  const { vectors } = useTypedSelector((state) => state.Vectors);
  const { logged_in, principal, pylon_account, actors } = useTypedSelector(
    (state) => state.Wallet
  );
  const { controller } = useParams();
  const navigate = useNavigate();

  // Determine active tab based on URL controller parameter
  const [activeTab, setActiveTab] = useState<"all" | "my">(
    controller && principal && controller === principal ? "my" : "all"
  );

  // Add state for sorting
  const [sortField, setSortField] = useState<SortField>("created");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Sync tab state with URL parameter when controller changes
  useEffect(() => {
    if (controller && principal && controller === principal) {
      setActiveTab("my");
    } else if (!controller) {
      setActiveTab("all");
    }
  }, [controller, principal]);

  // Force re-render when authentication state changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Calculate user's vector count
  const userVectorsCount = useMemo(() => {
    if (!logged_in || !principal) return 0;

    return vectors.filter(
      (vector) =>
        vector.controllers &&
        vector.controllers.some(
          (controller) =>
            controller.owner && controller.owner.toString() === principal
        )
    ).length;
  }, [vectors, logged_in, principal]);

  const filteredVectors = useMemo(() => {
    // Step 1: Filter by controller or tab
    let result = vectors;

    if (controller) {
      // Filter by specific controller from URL
      result = vectors.filter(
        (vector) =>
          vector.controllers &&
          vector.controllers.some(
            (ctrl) => ctrl.owner && ctrl.owner.toString() === controller
          )
      );
    } else if (activeTab === "my" && logged_in && principal) {
      // Filter by user's principal if "my" tab is active but URL doesn't have controller
      result = vectors.filter(
        (vector) =>
          vector.controllers &&
          vector.controllers.some(
            (ctrl) => ctrl.owner && ctrl.owner.toString() === principal
          )
      );
    }

    // Step 2: Sort by field and direction
    return [...result].sort((a, b) => {
      if (sortField === "created" || !meta) {
        // Sort by creation timestamp
        const valueA = a.created;
        const valueB = b.created;
        return sortDirection === "asc"
          ? Number(valueA) - Number(valueB)
          : Number(valueB) - Number(valueA);
      } else {
        try {
          // Sort by staked amount using extractNodeType
          const nodeA = extractNodeType(a, meta);
          const nodeB = extractNodeType(b, meta);

          const amountA = nodeA.amount
            ? parseFloat(nodeA.amount.replace(/,/g, ""))
            : -1;
          const amountB = nodeB.amount
            ? parseFloat(nodeB.amount.replace(/,/g, ""))
            : -1;

          return sortDirection === "asc"
            ? amountA - amountB
            : amountB - amountA;
        } catch (error) {
          console.error("Error sorting by stake:", error);
          const valueA = a.created;
          const valueB = b.created;
          return sortDirection === "asc"
            ? Number(valueA) - Number(valueB)
            : Number(valueB) - Number(valueA);
        }
      }
    });
  }, [
    vectors,
    activeTab,
    logged_in,
    principal,
    controller,
    sortField,
    sortDirection,
    meta,
  ]);

  const handleTabChange = (tab: "all" | "my") => {
    if (tab === "my" && !logged_in) {
      // Optional: show login prompt or notification
      return;
    }

    setActiveTab(tab);

    // Update URL based on tab selection
    if (tab === "my" && principal) {
      navigate(`/vectors/${principal}`);
    } else {
      navigate("/vectors");
    }
  };

  // Handle sort change
  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field with default sort direction
      setSortField(field);
      setSortDirection("desc"); // Default to descending (newest or highest first)
    }
  };

  // Get the appropriate icon based on current sort state
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <HiMiniArrowsUpDown />;
    }
    return sortDirection === "desc" ? (
      <HiMiniArrowSmallDown />
    ) : (
      <HiMiniArrowSmallUp />
    );
  };

  const tvl = computeUsdValueOfNodes({
    nodes: filteredVectors,
    prices: prices,
    meta: meta,
    decimals: 2,
  });

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
      <Flex direction="row" gap={3} align="center" mt={3} color="fg.muted">
        <Flex
          align="center"
          px={2}
          py={1}
          bg="bg.muted"
          boxShadow={"md"}
          rounded="md"
        >
          <Text fontSize="sm" fontWeight={500}>
            Total value: {tvl ? tvl : "$0.00"}
          </Text>
        </Flex>
        {controller && (
          <Flex
            align="center"
            gap={1}
            px={2}
            py={1}
            bg="bg.muted"
            boxShadow={"md"}
            rounded="md"
          >
            <Text fontSize="sm" fontWeight={500}>
              {controller.substring(0, 5)}...
              {controller.substring(controller.length - 3)}
            </Text>
            <Flex
              aria-label="Remove controller filter"
              rounded="md"
              _hover={{ bg: "bg.emphasized", cursor: "pointer" }}
              onClick={() => navigate("/vectors")}
              fontSize="lg"
            >
              <HiMiniXMark />
            </Flex>
          </Flex>
        )}
      </Flex>
      <Flex
        bg="bg.subtle"
        boxShadow={"md"}
        mt={6}
        borderRadius={"md"}
        direction={"column"}
        w="100%"
      >
        <Flex align="center">
          <Button
            variant="ghost"
            borderTopLeftRadius={"md"}
            size="lg"
            colorPalette={activeTab === "all" ? "blue" : ""}
            bg={activeTab === "all" ? "bg.muted" : ""}
            onClick={() => handleTabChange("all")}
          >
            All Vectors
          </Button>
          <Button
            variant="ghost"
            size="lg"
            colorPalette={activeTab === "my" ? "blue" : ""}
            bg={activeTab === "my" ? "bg.muted" : ""}
            onClick={() => handleTabChange("my")}
            disabled={!logged_in}
            opacity={!logged_in ? 0.6 : 1}
            key={logged_in ? "auth" : "no-auth"} // Force re-render on auth change
          >
            <Flex align="center" gap={1.5}>
              My Vectors{" "}
              <Flex
                bg="blue.subtle"
                color="fg.info"
                px={1.5}
                borderRadius={"md"}
                align="center"
                justify="center"
              >
                {logged_in ? `${userVectorsCount}` : "0"}
              </Flex>
            </Flex>
          </Button>
        </Flex>
        <Separator />
        <Flex align="center" w="100%" bg="bg.muted">
          <Button
            variant="ghost"
            size="sm"
            disabled={!meta}
            onClick={() => handleSortChange("created")}
          >
            Created {getSortIcon("created")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSortChange("staked")}
            disabled={!meta}
            title={!meta ? "Loading metadata..." : ""}
          >
            Stake {getSortIcon("staked")}
          </Button>
          <Spacer />
          <CreateVector
            loggedIn={logged_in}
            pylonAccount={pylon_account}
            principal={principal}
            meta={meta}
            actors={actors}
          />
        </Flex>
        <Separator />
        <Flex direction="column" w="100%">
          {filteredVectors.map((vector, index) => (
            <VectorPreview key={index} vector={vector} first={index === 0} />
          ))}
        </Flex>
      </Flex>
    </Header>
  );
};

export default VectorsTable;
