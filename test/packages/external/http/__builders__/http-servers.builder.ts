import { HttpServerBunAdapter } from "@/packages/external/http/server/http-server.bun-adapter";
import { HttpServerExpressAdapter } from "@/packages/external/http/server/http-server.express-adapter";
import type { HttpErrorMapper } from "@/packages/infrastructure/http/http-error.mapper";
import type { HttpServer } from "@/packages/infrastructure/http/http-server";

type HttpServerFactory = (errorMapper?: HttpErrorMapper) => HttpServer;

export const HTTP_SERVERS: [string, HttpServerFactory][] = [
    ["Bun", (errorMapper) => new HttpServerBunAdapter(undefined, errorMapper)],
    ["Express", (errorMapper) => new HttpServerExpressAdapter(errorMapper)],
];
