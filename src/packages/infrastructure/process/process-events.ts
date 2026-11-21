export interface ProcessEvents {
    on(event: "unhandledRejection", listener: (reason: unknown) => void): unknown;
}
