import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { Flex, Box } from "@chakra-ui/react";
import { Nav } from "@/components";
import { Home, Vectors } from "@/pages";
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
          <Route path="/vectors" element={<Vectors />} />
          <Route path="/vectors/:controller" element={<p>by controller</p>} />
          <Route path="/vectors/:controller/:id" element={<p>by id</p>} />
          <Route path="*" element={<p>page not found</p>} />
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
        dispatch(refreshVectors({ pylon: actors.neuronPylon }));
      };
      
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
