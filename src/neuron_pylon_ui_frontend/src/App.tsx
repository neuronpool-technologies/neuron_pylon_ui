import React from "react";
import { Nav, Footer } from "./components";
import { Flex, Box } from "@chakra-ui/react";
import { Create, Wallet, ById, ByController, ErrorPage } from "./pages";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Create />} />
          <Route path="/controller/:controller" element={<ByController />} />
          <Route path="/id/:id" element={<ById />} />
          <Route path="/id/:id/:neuronid" element={<p>neuron overview</p>} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

const AppLayout = () => {
  // A layout component with navbar and footer
  // Outlet renders all the sub routes
  return (
    <Flex direction="column" h="100vh">
      <Box flex="1">
        <Nav />
        <Outlet />
      </Box>
      <Footer />
    </Flex>
  );
};
