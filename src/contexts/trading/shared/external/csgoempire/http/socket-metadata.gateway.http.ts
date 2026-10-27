import type { HttpClient } from "@/packages/infrastructure/http/http-client";
import type { GetSocketMetadataIO, SocketMetadataGateway } from "../../../infrastructure/csgoempire/http/socket-metadata.gateway";

export class SocketMetadataHttp implements SocketMetadataGateway {
    constructor(private readonly httpClient: HttpClient) {}

    async getSocketMetadata(): Promise<GetSocketMetadataIO.Response> {
        const response = await this.httpClient.get<GetSocketMetadataIO.Response>("/metadata/socket");
        return response;
    }
}
