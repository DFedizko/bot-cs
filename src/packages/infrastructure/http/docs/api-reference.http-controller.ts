import type { HttpController } from "../http-controller";
import type { HttpResponse, HttpServer } from "../http-server";
import { ApiDocumentHttpController } from "./api-document.http-controller";
import type { ApiReferencePage } from "./api-reference.page";

const HTML_HEADERS = { "content-type": "text/html; charset=utf-8" };

export class ApiReferenceHttpController implements HttpController {
    static readonly PATH = "/docs";

    constructor(
        httpServer: HttpServer,
        private readonly page: ApiReferencePage,
    ) {
        httpServer.get(ApiReferenceHttpController.PATH, () => this.handle());
    }

    async handle(): Promise<HttpResponse> {
        return { body: this.page.render(ApiDocumentHttpController.PATH), headers: HTML_HEADERS };
    }
}
