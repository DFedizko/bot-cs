const ANY_FREE_PORT = 0;

export const freePort = (): number => {
    const server = Bun.serve({ port: ANY_FREE_PORT, fetch: () => new Response() });
    const port = server.port ?? ANY_FREE_PORT;
    server.stop(true);
    return port;
};
