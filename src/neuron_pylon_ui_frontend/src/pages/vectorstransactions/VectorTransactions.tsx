import { useEffect, useState, useMemo } from "react";
import {
  useParams,
  NavLink,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useTypedSelector } from "@/hooks/useRedux";
import {
  Heading,
  Flex,
  Image as ChakraImage,
  Highlight,
  Text,
  Icon,
  Separator,
  Breadcrumb,
  IconButton,
} from "@chakra-ui/react";
import { ClipboardIconButton, ClipboardRoot } from "@/components/ui/clipboard";
import { Header, StatBox, VectorTransaction } from "@/components";
import { useActors } from "@/hooks/useActors";
import { extractNodeType } from "@/utils/Node";
import { tokensIcons } from "@/utils/TokensIcons";
import { TiBatteryFull, TiBatteryLow } from "react-icons/ti";
import { BiArrowBack } from "react-icons/bi";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination";
import { processChronoLogTransactions } from "@/utils/ChronoTools";
import { SearchResp } from "@/chrono/declarations/chrono_slice/chrono_slice.did";
import { fetchVectorTransactions } from "@/client/fetchVectorTransactions";
import { VectorTransactionsLoading } from "./components";

const TRANSACTIONS_PER_PAGE = 10;
const MAX_TRANSACTIONS_FETCH = 500;

const VectorTransactions = () => {
  const { controller, id } = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { meta, prices } = useTypedSelector((state) => state.Meta);
  const { vectors } = useTypedSelector((state) => state.Vectors);
  const { actors } = useActors();

  const [transactions, setTransactions] = useState<SearchResp>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Scroll to top only on initial component mount, not on pagination
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // Empty dependency array means this only runs on mount

  const vector = useMemo(() => {
    return vectors.find((v) => v.id.toString() === id);
  }, [vectors, id]);

  // Fetch transactions when component mounts or when essential params change
  useEffect(() => {
    const loadTransactions = async () => {
      if (!id || !controller || !actors.router) return;

      const currentVector = vectors.find((v) => v.id.toString() === id);
      if (!currentVector) return;

      setLoading(true);
      setError(null);

      try {
        const vectorTransactions = await fetchVectorTransactions({
          router: actors.router as any,
          vector: currentVector,
          limit: MAX_TRANSACTIONS_FETCH,
        });

        const processedTransactions = processChronoLogTransactions(
          vectorTransactions,
          {
            vectorId: currentVector.id,
            limit: MAX_TRANSACTIONS_FETCH,
          }
        );

        setTransactions(processedTransactions);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load transactions"
        );
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [id, controller, actors.router, vectors.length]);

  // Calculate pagination
  const totalTransactions = transactions.length;
  const startIndex = (currentPage - 1) * TRANSACTIONS_PER_PAGE;
  const endIndex = startIndex + TRANSACTIONS_PER_PAGE;
  const paginatedTransactions = useMemo(() => {
    return transactions.slice(startIndex, endIndex);
  }, [transactions, startIndex, endIndex]);

  // Simple page change handler
  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  // Compute derived values
  const { type, name, value, label, symbol, active, created, amount } =
    vector && meta
      ? extractNodeType(vector, meta)
      : {
          type: "",
          name: "",
          value: "",
          label: "",
          symbol: "",
          active: false,
          created: "",
          amount: 0,
        };

  const tokenImage = vector
    ? tokensIcons.find((images) => images.symbol === symbol) || tokensIcons[1]
    : tokensIcons[1];

  const tokenRate = prices?.find((price) => price.symbol === symbol);

  if (!meta || !vectors.length) return <VectorTransactionsLoading />;

  if (!vector) return <VectorTransactionsLoading />;

  return (
    <Header>
      <Flex gap={3} mb={3} align="center">
        <NavLink to={`/vectors/${controller}/${id}`}>
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
            <Breadcrumb.Item lineClamp={1}>
              <NavLink
                to={
                  location.state?.from
                    ? `/vectors/${location.state.from}`
                    : "/vectors"
                }
              >
                Vectors
              </NavLink>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item lineClamp={1}>
              <NavLink to={`/vectors/${controller}/${id}`}>
                Vector #{id}
              </NavLink>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item lineClamp={1}>
              <Breadcrumb.CurrentLink>Transactions</Breadcrumb.CurrentLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb.Root>
      </Flex>

      <Flex
        bg="bg.subtle"
        boxShadow={"md"}
        borderRadius={"md"}
        direction={"column"}
        w="100%"
        p={3}
        gap={3}
        mb={6}
      >
        <Flex align="center" gap={3}>
          <ChakraImage
            src={tokenImage.src}
            alt={tokenImage.symbol}
            bg={"bg.emphasized"}
            borderRadius="full"
            h={45}
            w={45}
          />
          <Heading
            letterSpacing="tight"
            size={{ base: "xl", md: "2xl" }}
            lineClamp={1}
          >
            <Highlight
              query={name}
              styles={{
                px: "1",
                py: "1",
                color: "blue.fg",
              }}
            >
              {`${type} ${name}`}
            </Highlight>
          </Heading>
        </Flex>
        <Flex align="center" gap={2}>
          <Text
            fontSize="sm"
            fontWeight={500}
            color="fg.muted"
            textTransform={"uppercase"}
          >
            vector #{id}
          </Text>
          <Text fontSize="sm" fontWeight={500} color="fg.muted">
            •
          </Text>
          <Text
            fontSize="sm"
            fontWeight={500}
            color="fg.muted"
            textTransform={"uppercase"}
          >
            {created}
          </Text>
          {type === "Neuron" && prices && prices.length > 0 ? (
            <>
              <Text fontSize="sm" fontWeight={500} color="fg.muted">
                •
              </Text>
              <Text
                fontSize="sm"
                fontWeight={500}
                color="fg.muted"
                textTransform={"uppercase"}
              >
                {amount !== undefined && Number(amount) > 0 && tokenRate
                  ? `$${(Number(amount) * tokenRate.last_price).toLocaleString(
                      "en-US",
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}`
                  : null}
              </Text>
            </>
          ) : null}
        </Flex>
        <Flex gap={3} direction={{ base: "column", md: "row" }}>
          <Flex w="fit-content">
            <StatBox title={"Owner"} bg={"bg.subtle"}>
              <Text lineClamp={1} fontSize="md" fontWeight={500}>
                {controller}
              </Text>
              <ClipboardRoot value={controller}>
                <ClipboardIconButton
                  variant="surface"
                  rounded="md"
                  boxShadow="xs"
                  size="2xs"
                  ms={3}
                />
              </ClipboardRoot>
            </StatBox>
          </Flex>
          <Flex w="fit-content">
            <StatBox title={label} bg={"bg.subtle"}>
              <Flex gap={2} align="center">
                <Text fontSize="md" fontWeight={500}>
                  {value}
                </Text>
                <Icon
                  fontSize={18}
                  color={active ? "green.solid" : "red.solid"}
                >
                  {active ? <TiBatteryFull /> : <TiBatteryLow />}
                </Icon>
              </Flex>
            </StatBox>
          </Flex>
        </Flex>
      </Flex>

      <Flex
        bg="bg.subtle"
        boxShadow={"md"}
        borderRadius={"md"}
        direction={"column"}
        w="100%"
      >
        <Heading p={3}>Transactions</Heading>
        <Separator />

        <Flex direction="column" w="100%" h="100%">
          {loading ? (
            <Flex
              align="center"
              justify={"center"}
              fontWeight={500}
              my={12}
              h="100%"
              fontSize="md"
            >
              Loading transactions...
            </Flex>
          ) : error ? (
            <Flex
              align="center"
              justify={"center"}
              fontWeight={500}
              my={12}
              h="100%"
              fontSize="md"
              color="red.solid"
            >
              Failed to load transactions: {error}
            </Flex>
          ) : paginatedTransactions.length > 0 ? (
            paginatedTransactions.map((transactions, index) => (
              <VectorTransaction
                transactions={transactions}
                first={index === 0}
                showLink={false}
                key={index}
              />
            ))
          ) : (
            <Flex
              align="center"
              justify={"center"}
              fontWeight={500}
              my={12}
              h="100%"
              fontSize="md"
            >
              No transactions found...
            </Flex>
          )}
        </Flex>

        {!loading && !error && (
          <>
            <Separator />
            <Flex justify="center">
              <PaginationRoot
                count={totalTransactions}
                pageSize={TRANSACTIONS_PER_PAGE}
                page={currentPage}
                onPageChange={(e) => handlePageChange(e.page)}
                variant="outline"
                size={{ base: "xs", md: "sm" }}
                py={3}
                siblingCount={1}
              >
                <PaginationPrevTrigger />
                <PaginationItems />
                <PaginationNextTrigger />
              </PaginationRoot>
            </Flex>
          </>
        )}
      </Flex>
    </Header>
  );
};

export default VectorTransactions;
