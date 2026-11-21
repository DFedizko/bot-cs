export type ApiDocumentJson = Record<string, unknown>;

export interface ApiDocument {
    toJson(): ApiDocumentJson;
}
