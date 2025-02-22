import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "@/components/ui/provider";
import { Provider as ReduxProvider } from "react-redux";
import store from "./state/store";

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <Provider>
      <ReduxProvider store={store}>
        <App />
      </ReduxProvider>
    </Provider>
  );
} else {
  console.error("Root element not found");
}
