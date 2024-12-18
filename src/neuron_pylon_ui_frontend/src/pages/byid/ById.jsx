import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Divider,
  VStack,
  useColorMode,
  useClipboard,
  Flex,
  Spacer,
  IconButton,
  Container,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Text,
  Badge,
  SkeletonText,
} from "@chakra-ui/react";
import {
  ArrowBackIcon,
  ChevronRightIcon,
  CopyIcon,
  CheckIcon,
} from "@chakra-ui/icons";
import {
  darkColorBox,
  lightColorBox,
  lightBorderColor,
  darkBorderColor,
  lightGrayColorBox,
  darkGrayColorBox,
} from "../../colors";
import "../../../assets/main.css";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { useParams, NavLink } from "react-router-dom";
import { Hashicon } from "@emeraldpay/hashicon-react";
import { startNeuronPylonClient } from "../../client/Client";
import { e8sToIcp } from "../../tools/conversions";

const ById = () => {
  const { id } = useParams();
  const { colorMode, toggleColorMode } = useColorMode();
  const [loaded, setLoaded] = useState(false);
  const [icpvector, setIcpVector] = useState(null);
  const [snsvector, setSnsVector] = useState(null);

  const loadVector = async () => {
    const pylon = await startNeuronPylonClient();
    const nodeRes = await pylon.icrc55_get_nodes([{ id: Number(id) }]);
    const module = nodeRes[0][0]?.custom[0];

    if (module && "devefi_jes1_icpneuron" in module) {
      setIcpVector(nodeRes[0][0]);
    } else {
      setSnsVector(nodeRes[0][0]); // not used for now
    }

    setLoaded(true);
  };

  useEffect(() => {
    loadVector();
  }, []);

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
          separator={<ChevronRightIcon boxSize={5} color="gray.500" />}
        >
          <BreadcrumbItem _hover={{ textDecoration: "underline" }}>
            <NavLink to="/">Vectors</NavLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>ID</BreadcrumbLink>
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
        {loaded && icpvector ? <IcpNeuronVector icpvector={icpvector} /> : null}
        {loaded && snsvector ? <>SNS vector</> : null}
        {!loaded ? <LoadingBox /> : null}
        {loaded && !icpvector && !snsvector ? <NotFoundBox id={id} /> : null}
      </Box>
    </Container>
  );
};

export default ById;

const IcpNeuronVector = ({ icpvector }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const stakeSource = encodeIcrcAccount({
    owner: icpvector.sources[0].endpoint.ic.account.owner,
    subaccount: icpvector.sources[0].endpoint.ic.account.subaccount[0],
  });

  const maturityDestination = encodeIcrcAccount({
    owner: icpvector.destinations[0].endpoint.ic.account[0].owner,
    subaccount: icpvector.destinations[0].endpoint.ic.account[0].subaccount[0],
  });

  const disburseDestination = encodeIcrcAccount({
    owner: icpvector.destinations[1].endpoint.ic.account[0].owner,
    subaccount: icpvector.destinations[1].endpoint.ic.account[0].subaccount[0],
  });

  console.log(icpvector);
  return (
    <>
      <Flex align="center" w="100%">
        <Flex mr={3}>
          <Hashicon value={icpvector.id.toString()} size={45} />
        </Flex>
        <VStack align="start" spacing="0">
          <Text fontWeight="bold" fontSize={{ base: "sm", md: "lg" }}>
            {e8sToIcp(
              Number(
                icpvector.custom[0].devefi_jes1_icpneuron.cache
                  .cached_neuron_stake_e8s[0]
              )
            ).toFixed(4)}{" "}
            ICP
          </Text>
          <Text fontSize={"sm"} color="gray.500">
            ICP Neuron Vector
          </Text>
        </VStack>
        <Spacer />
        {icpvector.active && !icpvector.billing.frozen ? (
          <Badge
            variant="outline"
            colorScheme="green"
            animation="pulse 2s infinite"
          >
            Active
          </Badge>
        ) : (
          <Badge variant="outline" colorScheme="red">
            Frozen
          </Badge>
        )}
      </Flex>
      <Text fontWeight="bold" fontSize={"md"} my={3}>
        Source accounts
      </Text>
      <Box
        border={
          colorMode === "light"
            ? `solid ${lightBorderColor} 1px`
            : `solid ${darkBorderColor} 1px`
        }
        borderRadius="md"
        p={3}
      >
        <Flex align="center" gap={6} mb={3}>
          <VStack align="start" spacing="0">
            <Text fontSize={"sm"} color="gray.500">
              Source
            </Text>
            <Text fontWeight="bold" fontSize={"md"}>
              {icpvector.sources[0].name}
            </Text>
          </VStack>
          <VStack align="start" spacing="0">
            <Text fontSize={"sm"} color="gray.500">
              Balance
            </Text>
            <Text fontWeight="bold" fontSize={"md"}>
              {e8sToIcp(Number(icpvector.sources[0].balance)).toFixed(4)} ICP
            </Text>
          </VStack>
          <Spacer />
          <CopyAddress address={stakeSource} />
        </Flex>
        <Box
          bg={colorMode === "light" ? lightGrayColorBox : darkGrayColorBox}
          borderRadius="md"
          p={3}
        >
          <Text noOfLines={3}>{stakeSource}</Text>
        </Box>
      </Box>
      <Text fontWeight="bold" fontSize={"md"} my={3}>
        Destination accounts
      </Text>
      <Box
        border={
          colorMode === "light"
            ? `solid ${lightBorderColor} 1px`
            : `solid ${darkBorderColor} 1px`
        }
        borderRadius="md"
        p={3}
      >
        <Flex align="center" mb={3}>
          <VStack align="start" spacing="0">
            <Text fontSize={"sm"} color="gray.500">
              Destination
            </Text>
            <Text fontWeight="bold" fontSize={"md"}>
              {icpvector.destinations[0].name}
            </Text>
          </VStack>
          <Spacer />
          <CopyAddress address={maturityDestination} />
        </Flex>
        <Box
          bg={colorMode === "light" ? lightGrayColorBox : darkGrayColorBox}
          borderRadius="md"
          p={3}
        >
          <Text noOfLines={3}>{maturityDestination}</Text>
        </Box>
      </Box>
      <Box
        border={
          colorMode === "light"
            ? `solid ${lightBorderColor} 1px`
            : `solid ${darkBorderColor} 1px`
        }
        mt={3}
        borderRadius="md"
        p={3}
      >
        <Flex align="center" mb={3}>
          <VStack align="start" spacing="0">
            <Text fontSize={"sm"} color="gray.500">
              Destination
            </Text>
            <Text fontWeight="bold" fontSize={"md"}>
              {icpvector.destinations[1].name}
            </Text>
          </VStack>
          <Spacer />
          <CopyAddress address={disburseDestination} />
        </Flex>
        <Box
          bg={colorMode === "light" ? lightGrayColorBox : darkGrayColorBox}
          borderRadius="md"
          p={3}
        >
          <Text noOfLines={3}>{disburseDestination}</Text>
        </Box>
      </Box>
    </>
  );
};

const LoadingBox = () => {
  return <SkeletonText noOfLines={10} spacing={4} skeletonHeight={6} />;
};

const NotFoundBox = ({ id }) => {
  return (
    <Flex align="center" justify="center" w="100%" h={300}>
      <VStack>
        <Hashicon value={id} size={45} />
        <Heading textAlign="center" size={["sm", null, "md"]}>
          Vector not found :(
        </Heading>
        <Text maxW="sm" textAlign="center" color="gray.500">
          Please try another vector
        </Text>
      </VStack>
    </Flex>
  );
};

const CopyAddress = ({ address }) => {
  const { hasCopied, onCopy } = useClipboard();

  return (
    <IconButton
      rounded="full"
      boxShadow="base"
      icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
      size="sm"
      onClick={() => onCopy(address)}
    />
  );
};
