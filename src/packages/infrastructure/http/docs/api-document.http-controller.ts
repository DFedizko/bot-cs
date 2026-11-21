import type { HttpController } from "../http-controller";
import type { HttpResponse, HttpServer } from "../http-server";
import type { ApiDocument } from "./api-document";

export class ApiDocumentHttpController implements HttpController {
    static readonly PATH = "/openapi.json";

    constructor(
        httpServer: HttpServer,
        private readonly apiDocument: ApiDocument,
    ) {
        httpServer.get(ApiDocumentHttpController.PATH, () => this.handle());
    }

    async handle(): Promise<HttpResponse> {
        return { body: this.apiDocument.toJson() };
    }
}
