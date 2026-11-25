import type { Container } from "inversify";
import { HTTP_CONTROLLER, HTTP_SERVER } from "@/packages/external/di/packages.identifiers";
import { freePort } from "@/packages/external/http/__builders__/free-port.builder";
import { ApiDocumentHttpController } from "@/packages/infrastructure/http/docs/api-document.http-controller";

export const servedApiDocument = async (container: Container): Promise<string> => {
    await container.getAllAsync(HTTP_CONTROLLER);
    const port = freePort();
    container.get(HTTP_SERVER).listen(port);
    const response = await fetch(`http://localhost:${port}${ApiDocumentHttpController.PATH}`);
    return response.text();
};
