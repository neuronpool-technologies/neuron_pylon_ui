import React, { useEffect, useState } from "react";
import {
  Box,
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
  lightGrayTextColor,
  darkGrayTextColor,
} from "@/colors";
import { useParams, NavLink } from "react-router-dom";
import { startNeuronPylonClient } from "@/client/Client";
import { LoadingBox, NotFoundBox } from "./neuronoverview/components";
import NeuronOverview from "./neuronoverview/NeuronOverview";
import { Shared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";

const ByNeuron = () => {
  const { id, neuron } = useParams();
  const { colorMode, toggleColorMode } = useColorMode();

  const [loaded, setLoaded] = useState<boolean>(false);
  const [icpneuron, setIcpNeuron] = useState<Shared | null>(null);

  const loadVector = async () => {
    const pylon = await startNeuronPylonClient();
    const nodeRes = await pylon.icrc55_get_nodes([{ id: Number(id) }]);
    const module = nodeRes[0][0]?.custom[0];

    if (
      module &&
      "devefi_jes1_icpneuron" in module &&
      module.devefi_jes1_icpneuron.cache.neuron_id[0].toString() === neuron
    ) {
      setIcpNeuron(module);
    }

    setLoaded(true);
  };

  useEffect(() => {
    loadVector();
  }, []);

  return (
    <Container maxW="xl" my={5}>
      <Flex align="center" mb={3}>
        <NavLink to={`/id/${id}`}>
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
          separator={
            <ChevronRightIcon
              boxSize={5}
              color={
                colorMode === "light" ? lightGrayTextColor : darkGrayTextColor
              }
            />
          }
        >
          <BreadcrumbItem _hover={{ textDecoration: "underline" }}>
            <NavLink to="/">Vectors</NavLink>
          </BreadcrumbItem>

          <BreadcrumbItem _hover={{ textDecoration: "underline" }}>
            <NavLink to={`/id/${id}`}>ID</NavLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Neuron</BreadcrumbLink>
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
        {loaded && icpneuron ? <NeuronOverview module={icpneuron} /> : null}
        {!loaded ? <LoadingBox /> : null}
        {loaded && !icpneuron ? <NotFoundBox id={id} neuron={neuron} /> : null}
      </Box>
    </Container>
  );
};

export default ByNeuron;
