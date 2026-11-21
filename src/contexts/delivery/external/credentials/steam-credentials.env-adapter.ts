import z, { type ZodError } from "zod";
import type { SteamCredentials, SteamCredentialsDTO } from "../../application/steam-credentials";
import { SteamCredentialsNotFoundError } from "../../application/steam-credentials-not-found.error";
import { InvalidSteamAccountsError } from "./invalid-steam-accounts.error";

const NO_ACCOUNTS = "[]";
const NOT_JSON = '"not valid JSON"';

const steamAccountsSchema = z.array(
    z.object({
        accountId: z.number().int().positive(),
        username: z.string().min(1),
        password: z.string().min(1),
        sharedSecret: z.string().min(1),
        identitySecret: z.string().min(1),
    }),
);

type SteamAccount = z.infer<typeof steamAccountsSchema>[number];

export class SteamCredentialsEnvAdapter implements SteamCredentials {
    private readonly accounts: Map<number, SteamCredentialsDTO>;

    constructor(rawAccounts: string | undefined) {
        this.accounts = new Map(this.parse(rawAccounts ?? NO_ACCOUNTS).map((account) => this.toEntry(account)));
    }

    async forAccount(accountId: number): Promise<SteamCredentialsDTO> {
        const credentials = this.accounts.get(accountId);
        if (!credentials) throw new SteamCredentialsNotFoundError(accountId);
        return { ...credentials };
    }

    private parse(rawAccounts: string): SteamAccount[] {
        const result = steamAccountsSchema.safeParse(this.readJson(rawAccounts));
        if (!result.success) throw new InvalidSteamAccountsError(this.formatFields(result.error));
        return result.data;
    }

    private readJson(rawAccounts: string): unknown {
        try {
            return JSON.parse(rawAccounts);
        } catch {
            throw new InvalidSteamAccountsError(NOT_JSON);
        }
    }

    private formatFields(error: ZodError): string {
        return error.issues.map((issue) => `"${issue.path.join(".")}"`).join("; ");
    }

    private toEntry({ accountId, ...credentials }: SteamAccount): [number, SteamCredentialsDTO] {
        return [accountId, credentials];
    }
}
