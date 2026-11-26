import { mswServer } from "@/__setup__/msw-server";

export function captureRequests(): Array<URL> {
    const urls: Array<URL> = [];
    mswServer.events.on("request:start", ({ request }) => urls.push(new URL(request.url)));
    return urls;
}
