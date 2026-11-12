import { SocketMetadataHttpFakeAdapter } from "@/contexts/trading/shared/external/csgoempire/http/socket-metadata.http.fake-adapter";
import type {
    GetSocketMetadataIO,
    SocketMetadataHttp,
} from "@/contexts/trading/shared/infrastructure/csgoempire/http/socket-metadata.http";

let socketMetadataGateway: SocketMetadataHttp;

describe("SocketMetadataHttp", () => {
    beforeEach(() => {
        socketMetadataGateway = new SocketMetadataHttpFakeAdapter();
    });

    it("Should get scoket metadata", async () => {
        const response = await socketMetadataGateway.getSocketMetadata();
        expectTypeOf(response).toEqualTypeOf<GetSocketMetadataIO.Response>();
    });
});
