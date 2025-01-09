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
import { useParams, NavLink, useLocation } from "react-router-dom";
import { decodeIcrcAccount, IcrcAccount } from "@dfinity/ledger-icrc";
import { startNeuronPylonClient } from "@/client/Client";
import { NotFoundBox } from "./vectoroverview/components";
import VectorOverview from "./vectoroverview/VectorOverview";
import { NodeShared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { LoadingBox } from "@/components";

const ById = () => {
  const { controller, id } = useParams();
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [icpneuronvector, setIcpNeuronVector] = useState<NodeShared | null>(
    null
  );

  const loadVector = async () => {
    try {
      setLoaded(false);
      const accountController: IcrcAccount = decodeIcrcAccount(controller);

      if (Number.isFinite(Number(id))) {
        const pylon = await startNeuronPylonClient();
        const nodeRes = await pylon.icrc55_get_nodes([{ id: Number(id) }]);
        const node = nodeRes[0][0];
        const module = node?.custom[0];

        node.controllers.some(
          (controller) =>
            controller.owner.toString() === accountController.owner.toString()
        );
        if (
          module &&
          "devefi_jes1_icpneuron" in module &&
          node.controllers.some(
            (controller) =>
              controller.owner.toString() === accountController.owner.toString()
          )
        ) {
          setIcpNeuronVector(nodeRes[0][0]);
        }
      }

      setLoaded(true);
    } catch (error) {
      setIcpNeuronVector(null);
      setLoaded(true);
    }
  };

  useEffect(() => {
    loadVector();
  }, [location]);

  return (
    <Container maxW="xl" my={5}>
      <Flex align="center" mb={3}>
        <NavLink
          to={location.state?.from === "/vectors" ? `/vectors` : `/vectors/${controller}`}
        >
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
          fontWeight={500}
        >
          <BreadcrumbItem _hover={{ textDecoration: "underline" }}>
            <NavLink to="/vectors">Vectors</NavLink>
          </BreadcrumbItem>

          {location.state?.from !== "/vectors" ? (
            <BreadcrumbItem _hover={{ textDecoration: "underline" }}>
              <NavLink to={`/vectors/${controller}`}>Controller</NavLink>
            </BreadcrumbItem>
          ) : null}

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
          <VectorOverview controller={controller} vector={icpneuronvector} />
        ) : null}
        {!loaded ? <LoadingBox /> : null}
        {loaded && !icpneuronvector ? (
          <NotFoundBox id={id} controller={controller} />
        ) : null}
      </Box>
    </Container>
  );
};

export default ById;
