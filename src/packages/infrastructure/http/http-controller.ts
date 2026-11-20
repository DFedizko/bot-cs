import type { HttpRequest, HttpResponse } from "./http-server";

export interface HttpController<TOutput extends HttpResponse = HttpResponse> {
    handle(request: HttpRequest): Promise<TOutput>;
}
