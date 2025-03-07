import { useParams, useNavigate, NavLink, useLocation } from "react-router-dom";
import { useTypedSelector } from "@/hooks/useRedux";
import {
  Heading,
  Flex,
  Image as ChakraImage,
  Highlight,
  Text,
  Icon,
  Separator,
  Tabs,
  Breadcrumb,
  IconButton,
} from "@chakra-ui/react";
import { ClipboardIconButton, ClipboardRoot } from "@/components/ui/clipboard";
import { Header, StatBox } from "@/components";
import { extractNodeType } from "@/utils/Node";
import { tokensIcons } from "@/utils/TokensIcons";
import { TiBatteryFull, TiBatteryLow } from "react-icons/ti";
import { BiArrowBack } from "react-icons/bi";
import {
  NeuronAbout,
  SplitterAbout,
  Activity,
  Deposit,
  Billing,
  IcpNeuronModify,
  SnsNeuronModify,
  SplitterModify,
} from "./components";

const VectorOverview = () => {
  const { controller, id, tab } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { meta } = useTypedSelector((state) => state.Meta);
  const { vectors } = useTypedSelector((state) => state.Vectors);
  const { principal } = useTypedSelector((state) => state.Wallet);
  if (!meta) return null;

  const vector = vectors.find((v) => v.id.toString() === id);
  if (!vector) return null;

  const { type, name, value, label, symbol, active, created, activity } =
    extractNodeType(vector, meta);

  const tokenImage =
    tokensIcons.find((images) => images.symbol === symbol) || tokensIcons[1]; // default to ICP logo

  return (
    <Header>
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
              <Breadcrumb.CurrentLink>Vector #{id}</Breadcrumb.CurrentLink>
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
        </Flex>
        <Flex gap={3} direction={{ base: "column", md: "row" }}>
          <Flex w="fit-content">
            <StatBox title={"Controller"} bg={"bg.subtle"}>
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
          <Separator orientation="vertical" mt={3} hideBelow={"md"} />
          <Flex direction={{ base: "row", md: "row" }} gap={3}>
            <Flex w="fit-content">
              <StatBox
                title={label}
                value={value}
                bg={"bg.subtle"}
                fontSize="md"
              />
            </Flex>
            <Separator orientation="vertical" mt={3} hideBelow={"md"} />
            <Flex w="fit-content">
              <StatBox title={active ? "Active" : "Frozen"} bg={"bg.subtle"}>
                <Icon
                  size="lg"
                  color={active ? "green.solid" : "red.solid"}
                  w="40px"
                >
                  {active ? <TiBatteryFull /> : <TiBatteryLow />}
                </Icon>
              </StatBox>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Flex
        bg="bg.subtle"
        boxShadow={"md"}
        mt={6}
        borderRadius={"md"}
        direction={"column"}
        w="100%"
        p={3}
      >
        <Tabs.Root
          defaultValue={tab ?? "deposit"}
          variant="enclosed"
          colorPalette={"blue"}
        >
          <Tabs.List>
            <Tabs.Trigger
              value={"deposit"}
              asChild
              onClick={() => navigate(`/vectors/${controller}/${id}/deposit`)}
            >
              <Text>Deposit</Text>
            </Tabs.Trigger>
            <Tabs.Trigger
              value={"billing"}
              asChild
              onClick={() => navigate(`/vectors/${controller}/${id}/billing`)}
            >
              <Text>Billing</Text>
            </Tabs.Trigger>
            <Tabs.Trigger
              value={"modify"}
              asChild
              onClick={() => navigate(`/vectors/${controller}/${id}/modify`)}
              // disabled={principal !== controller}
              disabled={true}
            >
              <Text>Modify</Text>
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="deposit">
            <Deposit vector={vector} meta={meta} />
          </Tabs.Content>
          <Tabs.Content value="billing">
            <Billing vector={vector} meta={meta} />
          </Tabs.Content>
          <Tabs.Content value="modify">
            {type === "Neuron" && symbol === "ICP" ? (
              <IcpNeuronModify vector={vector} meta={meta} />
            ) : type === "Neuron" && symbol !== "ICP" ? (
              <SnsNeuronModify vector={vector} meta={meta} />
            ) : type === "Splitter" ? (
              <SplitterModify vector={vector} meta={meta} />
            ) : null}
          </Tabs.Content>
        </Tabs.Root>
      </Flex>
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={{ base: 0, md: 3 }}
        w="100%"
      >
        <Flex
          bg="bg.subtle"
          boxShadow={"md"}
          mt={6}
          borderRadius={"md"}
          direction={"column"}
          w="100%"
        >
          <Heading p={3}>About</Heading>
          <Separator />
          {type === "Neuron" ? (
            <NeuronAbout vector={vector} meta={meta} />
          ) : type === "Splitter" ? (
            <SplitterAbout vector={vector} meta={meta} />
          ) : null}
        </Flex>
        {label === "Stake" ? (
          <Activity vectorLog={activity || []} vector={vector} />
        ) : null}
      </Flex>
    </Header>
  );
};

export default VectorOverview;
