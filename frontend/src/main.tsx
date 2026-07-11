import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PrimeReactProvider } from "primereact/api";

import App from "@/App";
import { primeReactValue } from "@/components/ui/primeConfig";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PrimeReactProvider value={primeReactValue}>
      <App />
    </PrimeReactProvider>
  </StrictMode>,
);
