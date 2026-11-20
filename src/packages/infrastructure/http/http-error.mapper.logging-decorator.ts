import type { Logger } from "@/packages/application/logger";
import type { HttpErrorMapper } from "./http-error.mapper";
import type { HttpResponse } from "./http-server";
import { HttpStatus } from "./http-status";

export class HttpErrorMapperLoggingDecorator implements HttpErrorMapper {
    constructor(
        private readonly errorMapper: HttpErrorMapper,
        private readonly logger: Logger,
    ) {}

    map(error: unknown): HttpResponse {
        const response = this.errorMapper.map(error);
        if (this.isServerError(response)) this.logger.log(this.describe(error));
        return response;
    }

    private isServerError(response: HttpResponse): boolean {
        return (response.status ?? HttpStatus.OK) >= HttpStatus.INTERNAL_SERVER_ERROR;
    }

    private describe(error: unknown): string {
        return error instanceof Error ? (error.stack ?? error.message) : String(error);
    }
}
