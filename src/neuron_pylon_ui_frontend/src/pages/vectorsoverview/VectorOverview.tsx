import { useParams, useNavigate } from "react-router-dom";
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
} from "@chakra-ui/react";
import { ClipboardIconButton, ClipboardRoot } from "@/components/ui/clipboard";
import { Header, StatBox } from "@/components";
import { extractNodeType } from "@/utils/Node";
import { tokensIcons } from "@/utils/TokensIcons";
import { TiBatteryFull, TiBatteryLow } from "react-icons/ti";
import { About, Activity, Faq, Deposit, Billing, Modify } from "./components";
import { endpointToBalanceAndAccount } from "@/utils/AccountTools";
import { e8sToIcp } from "@/utils/TokenTools";

const VectorOverview = () => {
  const { controller, id, tab } = useParams();
  const navigate = useNavigate();
  const { meta } = useTypedSelector((state) => state.Meta);
  const { vectors } = useTypedSelector((state) => state.Vectors);
  const { principal } = useTypedSelector((state) => state.Wallet);
  if (!meta) return null;

  const vector = vectors.find((v) => v.id.toString() === id);
  if (!vector) return null;

  const {
    type,
    name,
    label,
    symbol,
    active,
    created,
    fee,
    amount,
    billing,
    refreshingStake,
    minimumStake,
  } = extractNodeType(vector, meta);

  const source = endpointToBalanceAndAccount(vector.sources[0]);

  const billingTokenInfo = meta?.supported_ledgers.find((ledger) => {
    if (!("ic" in ledger?.ledger)) return false;
    return ledger?.ledger.ic.toString() === billing.ledger;
  });

  if (!billingTokenInfo) return null;

  const billingImage =
    tokensIcons.find((images) => images.symbol === billingTokenInfo.symbol) ||
    tokensIcons[1];

  const tokenImage =
    tokensIcons.find((images) => images.symbol === symbol) || tokensIcons[1]; // default to ICP logo

  const billingOption =
    billing.cost_per_day > 0
      ? `${e8sToIcp(Number(billing.cost_per_day))} ${
          billingTokenInfo.symbol
        } per day`
      : billing.transaction_percentage_fee_e8s > 0
      ? "5% of Maturity"
      : "None";

  return (
    <Header>
      <Flex
        bg="bg.subtle"
        boxShadow={"md"}
        mt={6}
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
        <Text
          fontSize="sm"
          fontWeight={500}
          color="fg.muted"
          textTransform={"uppercase"}
        >
          Vector #{id}
        </Text>
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
              <StatBox title={active ? "Active" : "Frozen"} bg={"bg.subtle"}>
                <Icon
                  size="lg"
                  color={active ? "green.solid" : "red.solid"}
                  w="60px"
                >
                  {active ? <TiBatteryFull /> : <TiBatteryLow />}
                </Icon>
              </StatBox>
            </Flex>
            <Separator orientation="vertical" mt={3} hideBelow={"md"} />
            <Flex w="fit-content">
              <StatBox
                title={"Created"}
                value={created}
                bg={"bg.subtle"}
                fontSize="md"
              />
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
              disabled={principal !== controller}
            >
              <Text>Modify</Text>
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="deposit">
            <Deposit
              vectorId={id ?? ""}
              image={tokenImage}
              ledger={source.ledger}
              tokenSymbol={symbol}
              tokenFee={e8sToIcp(Number(fee))}
              sourceBalance={source.balance}
              sourceAccount={source.account}
              sourceName={label}
              active={active}
            >
              {label === "Stake" ? (
                <StatBox
                  title={
                    active
                      ? amount !== undefined && Number(amount) > 0
                        ? "Neuron stake"
                        : minimumStake ?? "Neuron stake"
                      : "Neuron frozen"
                  }
                  value={`${amount} ${symbol}`}
                  bg={"bg.subtle"}
                  fontSize="md"
                  animation={refreshingStake && active}
                />
              ) : label === "Split" ? (
                <StatBox
                  title={active ? label : `${label} frozen`}
                  value={`${symbol}`}
                  bg={"bg.subtle"}
                  fontSize="md"
                />
              ) : null}
            </Deposit>
          </Tabs.Content>
          <Tabs.Content value="billing">
            <Billing
              vectorId={id ?? ""}
              image={billingImage}
              ledger={billing.ledger}
              tokenSymbol={billingTokenInfo.symbol}
              tokenFee={e8sToIcp(Number(billingTokenInfo.fee))}
              billingBalance={e8sToIcp(Number(billing.current_balance))}
              billingAccount={billing.account}
              active={active}
              billingOption={billingOption}
            />
          </Tabs.Content>
          <Tabs.Content value="modify">
            <Modify />
          </Tabs.Content>
        </Tabs.Root>
      </Flex>
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={{ base: 0, md: 3 }}
        w="100%"
      >
        <About />
        <Activity />
      </Flex>
      <Faq />
    </Header>
  );
};

export default VectorOverview;
