import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/app";
import { createQueryClient } from "./shared/adapters/create-query-client";
import { createAppRouter } from "./shared/adapters/create-app-router";
import { readViteAppConfig } from "./shared/adapters/read-vite-app-config";
import { HttpClientAxiosAdapter } from "./shared/adapters/http-client.axios-adapter";
import "./styles.css";

const ROOT_ELEMENT_ID = "app";

const queryClient = createQueryClient();
const router = createAppRouter({ queryClient });
const httpClient = new HttpClientAxiosAdapter(readViteAppConfig().botApiUrl);
const rootElement = document.getElementById(ROOT_ELEMENT_ID);

if (rootElement && !rootElement.innerHTML)
    createRoot(rootElement).render(
        <StrictMode>
            <App router={router} queryClient={queryClient} httpClient={httpClient} />
        </StrictMode>,
    );
