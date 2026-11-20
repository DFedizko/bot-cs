import { identifier } from "@/packages/external/di/identifier";
import type { HttpClient } from "@/packages/infrastructure/http/http-client";
import type { CsgWsClient } from "../../infrastructure/csgoempire/csg.ws-client";
import type {
    GetSocketMetadataIO,
    SocketMetadataHttp,
} from "../../infrastructure/csgoempire/http/socket-metadata.http";
import type { InitCsgSessionWsController } from "../../infrastructure/controllers/init-csg-session.ws-controller";

export const CSGOEMPIRE_HTTP_CLIENT = identifier<HttpClient>("CsgoempireHttpClient");
export const SOCKET_METADATA_HTTP = identifier<SocketMetadataHttp>("SocketMetadataHttp");
export const SOCKET_METADATA = identifier<GetSocketMetadataIO.Response>("SocketMetadata");
export const CSG_WS_CLIENT = identifier<CsgWsClient>("CsgWsClient");
export const INIT_CSG_SESSION = identifier<InitCsgSessionWsController>("InitCsgSessionWsController");
