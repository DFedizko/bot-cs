import { SocketMetadataGatewayFake } from "@/contexts/trading/shared/external/csgoempire/http/socket-metadata.gateway.fake";
import type {
    GetSocketMetadataIO,
    SocketMetadataGateway,
} from "@/contexts/trading/shared/infrastructure/csgoempire/http/socket-metadata.gateway";

let socketMetadataGateway: SocketMetadataGateway;

describe("SocketMetadataGateway", () => {
    beforeEach(() => {
        socketMetadataGateway = new SocketMetadataGatewayFake();
    });

    it("Should get scoket metadata", async () => {
        const response = await socketMetadataGateway.getSocketMetadata();
        expectTypeOf(response).toEqualTypeOf<GetSocketMetadataIO.Response>();
    });
});
