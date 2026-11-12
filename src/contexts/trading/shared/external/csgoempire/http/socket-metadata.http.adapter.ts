import type { HttpClient } from "@/packages/infrastructure/http/http-client";
import type {
    GetSocketMetadataIO,
    SocketMetadataHttp,
} from "../../../infrastructure/csgoempire/http/socket-metadata.http";

export class SocketMetadataHttpAdapter implements SocketMetadataHttp {
    constructor(private readonly httpClient: HttpClient) {}

    async getSocketMetadata(): Promise<GetSocketMetadataIO.Response> {
        const response = await this.httpClient.get<GetSocketMetadataIO.Response>("/metadata/socket");
        return response;
    }
}
