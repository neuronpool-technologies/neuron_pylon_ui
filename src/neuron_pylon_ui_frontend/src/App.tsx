import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { Flex, Box } from "@chakra-ui/react";
import { Nav } from "@/components";
import { Home, VectorsTable, VectorOverview, Error } from "@/pages";
import { Toaster } from "@/components/ui/toaster";
import { refreshMeta } from "@/state/MetaSlice";
import { useTypedDispatch } from "./hooks/useRedux";
import { useActors } from "./hooks/useActors";
import { refreshVectors } from "./state/VectorsSlice";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="/vectors" element={<VectorsTable />} />
          <Route path="/vectors/:controller" element={<VectorsTable />} />
          <Route path="/vectors/:controller/:id" element={<VectorOverview />} />
          <Route
            path="/vectors/:controller/:id/:tab"
            element={<VectorOverview />}
          />
          <Route path="*" element={<Error />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

const AppLayout = () => {
  const dispatch = useTypedDispatch();
  const { actors } = useActors();

  useEffect(() => {
    if (actors.neuronPylon) {
      const refresh = () => {
        dispatch(
          refreshVectors({
            pylon: actors.neuronPylon,
            router: actors.router,
          })
        );
      };``

      dispatch(refreshMeta({ pylon: actors.neuronPylon }));
      refresh();
      const interval = setInterval(refresh, 5000);

      return () => clearInterval(interval);
    }
  }, [actors]);

  return (
    <Flex direction="column" minH="100vh">
      <Box flex="1">
        <Nav />
        <Outlet />
      </Box>
      <Toaster />
    </Flex>
  );
};
