import { ApiDocumentContainer } from "@/composition-root/api-document-container";
import { API_DOCUMENT_EXPORTER, COMMAND_HANDLER, FILE_WRITER } from "@/packages/external/di/packages.identifiers";
import { CSG_WS_CLIENT, SOCKET_METADATA_HTTP } from "@/contexts/trading/shared/external/di/trading-shared.identifiers";
import { CSGOEMPIRE_AUCTION_HTTP } from "@/contexts/trading/bidding/external/di/bidding.identifiers";
import { CSG_DELIVERY_HTTP, STEAM_SESSIONS } from "@/contexts/delivery/external/di/delivery.identifiers";
import { FileWriterBunAdapter } from "@/packages/external/file/file-writer.bun-adapter";
import { ApiDocumentExporter } from "@/packages/infrastructure/http/docs/api-document.exporter";

const OUTSIDE_WORLD = [
    SOCKET_METADATA_HTTP,
    CSG_WS_CLIENT,
    CSGOEMPIRE_AUCTION_HTTP,
    CSG_DELIVERY_HTTP,
    STEAM_SESSIONS,
    COMMAND_HANDLER,
];

describe("ApiDocumentContainer", () => {
    it("Should bind the api document exporter", () => {
        const exporter = new ApiDocumentContainer().get(API_DOCUMENT_EXPORTER);

        expect(exporter).toBeInstanceOf(ApiDocumentExporter);
    });

    it("Should write the document with the bun file writer", () => {
        const writer = new ApiDocumentContainer().get(FILE_WRITER);

        expect(writer).toBeInstanceOf(FileWriterBunAdapter);
    });

    it("Should wire nothing that reaches csgoempire or steam, nor any command handler", () => {
        const container = new ApiDocumentContainer();

        const bound = OUTSIDE_WORLD.filter((identifier) => container.isBound(identifier));

        expect(bound).toEqual([]);
    });
});
