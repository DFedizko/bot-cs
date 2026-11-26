import { mswServer } from "@/__setup__/msw-server";

export type CapturedRequest = { method: string; path: string; body: unknown };

const readBody = async (request: Request) => {
    const text = await request.clone().text();
    return text ? (JSON.parse(text) as unknown) : null;
};

export function captureBodies(method: string): Array<CapturedRequest> {
    const requests: Array<CapturedRequest> = [];
    mswServer.events.on("request:start", async ({ request }) => {
        if (request.method !== method) return;
        const path = decodeURIComponent(new URL(request.url).pathname);
        requests.push({ method, path, body: await readBody(request) });
    });
    return requests;
}
