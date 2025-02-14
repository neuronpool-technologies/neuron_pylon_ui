import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { Flex, Box } from "@chakra-ui/react";
import { Nav } from "@/components/navbar";
import { Home } from "@/pages";
import { IdentityKitProvider, IdentityKitTheme } from "@nfid/identitykit/react";
import {
  IdentityKitAuthType,
  NFIDW,
  InternetIdentity,
  OISY,
} from "@nfid/identitykit";
import { useColorMode } from "@/components/ui/color-mode";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="/vectors" element={<p>vectors</p>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

const AppLayout = () => {
  const { toggleColorMode, colorMode } = useColorMode();
  return (
    <IdentityKitProvider
      authType={IdentityKitAuthType.DELEGATION}
      signerClientOptions={{
        targets: [process.env.REACT_APP_NEURON_PYLON_CANISTER_ID || ""],
      }}
      theme={
        colorMode === "light" ? IdentityKitTheme.LIGHT : IdentityKitTheme.DARK
      }
      discoverExtensionSigners={false}
      signers={[
        { ...NFIDW, description: "Sign in with email" },
        InternetIdentity,
        OISY,
      ]}
    >
      <Flex direction="column" h="100vh">
        <Box flex="1">
          <Nav />
          <Outlet />
        </Box>
      </Flex>
    </IdentityKitProvider>
  );
};
