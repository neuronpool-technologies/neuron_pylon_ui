import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { Flex, Box } from "@chakra-ui/react";
import { Nav } from "@/components";
import { Home } from "@/pages";
import { Toaster } from "@/components/ui/toaster"

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
  return (
    <Flex direction="column" h="100vh">
      <Box flex="1">
        <Nav />
        <Outlet />
      </Box>
      <Toaster />
    </Flex>
  );
};
