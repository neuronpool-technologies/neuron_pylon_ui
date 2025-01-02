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
} from "@/colors";
import { useParams, NavLink } from "react-router-dom";
import { startNeuronPylonClient } from "@/client/Client";
import { LoadingBox, NotFoundBox } from "./vectoroverview/components";
import VectorOverview from "./vectoroverview/VectorOverview";
import { NodeShared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";

const ById = () => {
  const { id } = useParams();
  const { colorMode, toggleColorMode } = useColorMode();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [icpneuronvector, setIcpNeuronVector] = useState<NodeShared | null>(
    null
  );

  const loadVector = async () => {
    if (Number.isFinite(Number(id))) {
      const pylon = await startNeuronPylonClient();
      const nodeRes = await pylon.icrc55_get_nodes([{ id: Number(id) }]);
      const module = nodeRes[0][0]?.custom[0];

      if (module && "devefi_jes1_icpneuron" in module) {
        setIcpNeuronVector(nodeRes[0][0]);
      }
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
        {loaded && icpneuronvector ? (
          <VectorOverview vector={icpneuronvector} />
        ) : null}
        {!loaded ? <LoadingBox /> : null}
        {loaded && !icpneuronvector ? <NotFoundBox id={id} /> : null}
      </Box>
    </Container>
  );
};

export default ById;
