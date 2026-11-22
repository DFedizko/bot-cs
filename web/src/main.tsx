import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/app";
import { createQueryClient } from "./app/create-query-client";
import { createAppRouter } from "./app/create-app-router";
import "./styles.css";

const ROOT_ELEMENT_ID = "app";

const queryClient = createQueryClient();
const router = createAppRouter({ queryClient });
const rootElement = document.getElementById(ROOT_ELEMENT_ID);

if (rootElement && !rootElement.innerHTML)
    createRoot(rootElement).render(
        <StrictMode>
            <App router={router} queryClient={queryClient} />
        </StrictMode>,
    );
