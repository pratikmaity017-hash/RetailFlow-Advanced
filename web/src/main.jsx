import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./app/App";
import { ThemeProvider } from "./app/ThemeProvider";
import { OrganizationProvider } from "./features/organization/OrganizationProvider";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <OrganizationProvider>
          <App />
        </OrganizationProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
