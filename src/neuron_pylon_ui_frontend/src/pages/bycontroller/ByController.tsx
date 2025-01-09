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
import ControllerOverview from "./controlleroverview/ControllerOverview";
import { startNeuronPylonClient } from "@/client/Client";
import { decodeIcrcAccount, IcrcAccount } from "@dfinity/ledger-icrc";
import { NodeShared } from "@/declarations/neuron_pylon/neuron_pylon.did.js";
import { NotFoundBox } from "./controlleroverview/components";
import { LoadingBox } from "@/components";

const ByController = () => {
  const { controller } = useParams();
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [icpneuronvectors, setIcpNeuronVectors] = useState<NodeShared[] | null>(
    null
  );

  const loadControllerVectors = async () => {
    try {
      setLoaded(false);
      const pylon = await startNeuronPylonClient();

      const accountController: IcrcAccount = decodeIcrcAccount(controller);

      const nodes = await pylon.icrc55_get_controller_nodes({
        id: {
          owner: accountController.owner,
          subaccount: accountController.subaccount
            ? [accountController.subaccount]
            : [],
        },
        start: 0,
        length: 100,
      });

      setIcpNeuronVectors(nodes);
      setLoaded(true);
    } catch (error) {
      setIcpNeuronVectors([]);
      setLoaded(true);
      console.error(error);
    }
  };

  useEffect(() => {
    loadControllerVectors();
  }, [location]);

  return (
    <Container maxW="xl" my={5}>
      <Flex align="center" mb={3}>
        <NavLink to={`/vectors`}>
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

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Controller</BreadcrumbLink>
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
        {loaded && icpneuronvectors && icpneuronvectors.length > 0 ? (
          <ControllerOverview
            vectors={icpneuronvectors}
            controller={controller}
          />
        ) : null}
        {!loaded ? <LoadingBox /> : null}
        {loaded && icpneuronvectors && icpneuronvectors.length === 0 ? (
          <NotFoundBox controller={controller} />
        ) : null}
      </Box>
    </Container>
  );
};

export default ByController;
