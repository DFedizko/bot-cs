import { HttpServerBunAdapter } from "@/packages/external/http/server/http-server.bun-adapter";
import { freePort } from "@/packages/external/http/__builders__/free-port.builder";
import { ApiDocumentHttpController } from "@/packages/infrastructure/http/docs/api-document.http-controller";
import { ApiReferenceHttpController } from "@/packages/infrastructure/http/docs/api-reference.http-controller";
import type { ApiDocument } from "@/packages/infrastructure/http/docs/api-document";
import type { ApiReferencePage } from "@/packages/infrastructure/http/docs/api-reference.page";

export const DOCUMENT = { openapi: "3.1.0", paths: {} };
export const PAGE = "<!doctype html><title>Foo API</title>";

const apiDocument: ApiDocument = { toJson: () => DOCUMENT };
const apiReferencePage: ApiReferencePage = { render: (documentUrl) => `${PAGE}${documentUrl}` };

export type DocsServer = { url: string; server: HttpServerBunAdapter };

export const startDocsServer = (): DocsServer => {
    const server = new HttpServerBunAdapter();
    new ApiDocumentHttpController(server, apiDocument);
    new ApiReferenceHttpController(server, apiReferencePage);
    const port = freePort();
    server.listen(port);
    return { url: `http://localhost:${port}`, server };
};
