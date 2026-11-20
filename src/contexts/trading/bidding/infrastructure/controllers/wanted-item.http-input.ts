import type { HttpRequest } from "@/packages/infrastructure/http/http-server";
import { BadRequestError } from "@/packages/infrastructure/http/errors/bad-request.error";
import type { CriteriaPrimitives } from "../../domain/wanted-item/criteria/criteria.factory";
import type { ItemCriterionType } from "../../domain/wanted-item/criteria/item-criterion";

type Body = Record<string, unknown>;

const DIGITS_ONLY = /^\d+$/;

export class WantedItemHttpInput {
    constructor(private readonly request: HttpRequest) {}

    readAccountId(): number {
        const accountId = this.request.params.accountId ?? "";
        if (!DIGITS_ONLY.test(accountId)) throw new BadRequestError("accountId must be a whole number");
        return Number(accountId);
    }

    readItemName(): string {
        return this.request.params.name ?? "";
    }

    readName(): string {
        const name = this.readBody().name;
        if (typeof name !== "string") throw new BadRequestError("name must be a text");
        return name;
    }

    readMaxFor(): string {
        const maxFor = this.readOptionalMaxFor();
        if (maxFor === undefined) throw new BadRequestError("maxFor is required");
        return maxFor;
    }

    readOptionalMaxFor(): string | undefined {
        const maxFor = this.readBody().maxFor;
        if (maxFor === undefined || typeof maxFor === "string") return maxFor;
        if (typeof maxFor === "number") return maxFor.toString();
        throw new BadRequestError("maxFor must be a text or a number");
    }

    readCriteria(): CriteriaPrimitives | undefined {
        const criteria = this.readBody().criteria;
        if (criteria === undefined) return undefined;
        if (!Array.isArray(criteria) || !criteria.every((item) => this.isCriterion(item)))
            throw new BadRequestError("criteria must be a list of { type, value } texts");
        return criteria.map(({ type, value }) => ({ type: type as ItemCriterionType, value }));
    }

    private readBody(): Body {
        const body = this.request.body;
        if (!this.isObject(body)) throw new BadRequestError("The body must be a JSON object");
        return body;
    }

    private isCriterion(item: unknown): item is { type: string; value: string } {
        return this.isObject(item) && typeof item.type === "string" && typeof item.value === "string";
    }

    private isObject(value: unknown): value is Body {
        return typeof value === "object" && value !== null && !Array.isArray(value);
    }
}
