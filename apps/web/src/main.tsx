import "~/style.css";

import React from "react";
import { RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import ReactDOM from "react-dom/client";

import { createRouter } from "~/router";

const ROOT_ELEMENT_ID = "app";

const rootElement = document.getElementById(ROOT_ELEMENT_ID);

if (!rootElement) {
  throw new Error(`Root element with ID '${ROOT_ELEMENT_ID}' not found.`);
}

const router = createRouter();

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        themes={["light", "dark"]}
        enableSystem
        disableTransitionOnChange
      >
        <RouterProvider router={router} />
      </ThemeProvider>
    </React.StrictMode>,
  );
}
