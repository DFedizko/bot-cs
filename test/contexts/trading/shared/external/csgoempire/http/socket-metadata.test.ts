import { SocketMetadataFake } from "@/contexts/trading/shared/external/csgoempire/http/socket-metadata.fake";
import type {
    GetSocketMetadataIO,
    SocketMetadata,
} from "@/contexts/trading/shared/infrastructure/csgoempire/http/socket-metadata";

let socketMetadata: SocketMetadata;

describe("SocketMetadata", () => {
    beforeEach(() => {
        socketMetadata = new SocketMetadataFake();
    });

    it("Should get scoket metadata", async () => {
        const response = await socketMetadata.getSocketMetadata();
        console.log(Bun.env.NODE_ENV);
        expectTypeOf(response).toEqualTypeOf<GetSocketMetadataIO.Response>();
    });
});
