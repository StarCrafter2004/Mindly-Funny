import { createRoot } from "react-dom/client";
import "@/app/index.css";
import App from "@/app/App.tsx";
import { BrowserRouter } from "react-router";
import { ToastContainer } from "react-toastify";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

createRoot(document.getElementById("root")!).render(
  <TonConnectUIProvider manifestUrl={import.meta.env.VITE_TON_MANIFEST_URL}>
    <BrowserRouter>
      <App />
      <ToastContainer />
    </BrowserRouter>
  </TonConnectUIProvider>,
);
