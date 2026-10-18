import type { HttpClient } from "@/shared/infrastructure/http/http-client";
import type { GetSocketMetadataIO, SocketMetadata } from "../../../infrastructure/csgoempire/http/socket-metadata";

export class SocketMetadataHttp implements SocketMetadata {
    constructor(private readonly httpClient: HttpClient) {}

    async getSocketMetadata(): Promise<GetSocketMetadataIO.Response> {
        const response = await this.httpClient.get<GetSocketMetadataIO.Response>("/metadata/socket");
        return response;
    }
}
