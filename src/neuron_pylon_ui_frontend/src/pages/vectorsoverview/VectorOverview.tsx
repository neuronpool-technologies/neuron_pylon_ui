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
import { Header, StatVector } from "@/components";
import { extractNodeType } from "@/utils/Node";
import { tokensIcons } from "@/utils/TokensIcons";
import { TiBatteryFull, TiBatteryLow } from "react-icons/ti";
import { About, Activity, Faq, Deposit, Billing, Modify } from "./components";

const VectorOverview = () => {
  const { controller, id, tab } = useParams();
  const navigate = useNavigate();
  const { meta } = useTypedSelector((state) => state.Meta);
  const { vectors } = useTypedSelector((state) => state.Vectors);
  const { principal } = useTypedSelector((state) => state.Wallet);
  if (!meta) return null;

  const vector = vectors.find((v) => v.id.toString() === id);
  if (!vector) return null;

  const { type, name, symbol, active, created } = extractNodeType(vector, meta);
  const image =
    tokensIcons.find((images) => images.symbol === symbol) || tokensIcons[1]; // default to ICP logo

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
      >
        <Flex align="center" gap={3}>
          <ChakraImage
            src={image.src}
            alt={image.symbol}
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
          mt={3}
        >
          Vector #{id}
        </Text>
        <Flex gap={3} mt={3} direction={{ base: "column", md: "row" }}>
          <StatVector name={"Controller"}>
            <Text fontSize="md" fontWeight={500} lineClamp={1} w="100%">
              {controller}
            </Text>
            <ClipboardRoot value={controller}>
              <ClipboardIconButton
                variant="surface"
                rounded="md"
                boxShadow="xs"
                size="2xs"
              />
            </ClipboardRoot>
          </StatVector>
          <Separator orientation="vertical" mt={3} hideBelow={"md"} />
          <Flex w="100%" gap={3}>
            <StatVector name={active ? "Active" : "Frozen"}>
              <Icon size="lg" color={active ? "green.solid" : "red.solid"}>
                {active ? <TiBatteryFull /> : <TiBatteryLow />}
              </Icon>
            </StatVector>
            <Separator orientation="vertical" mt={3} hideBelow={"md"} />
            <StatVector name={"Created"}>
              <Text fontSize="md" fontWeight={500} lineClamp={1}>
                {created}
              </Text>
            </StatVector>
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
            <Deposit />
          </Tabs.Content>
          <Tabs.Content value="billing">
            <Billing />
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
