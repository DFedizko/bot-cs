import { SteamCredentialsEnvAdapter } from "@/contexts/delivery/external/credentials/steam-credentials.env-adapter";
import { InvalidSteamAccountsError } from "@/contexts/delivery/external/credentials/errors/invalid-steam-accounts.error";
import { SteamCredentialsNotFoundError } from "@/contexts/delivery/external/credentials/errors/steam-credentials-not-found.error";

const ACCOUNT_ID = 303119;
const PASSWORD = "hunter2-secret";
const ACCOUNT = {
    accountId: ACCOUNT_ID,
    username: "buyer",
    password: PASSWORD,
    sharedSecret: "c2hhcmVk",
    identitySecret: "aWRlbnRpdHk=",
};

describe("SteamCredentialsEnvAdapter", () => {
    it("Should give the credentials of the account", async () => {
        const credentials = await new SteamCredentialsEnvAdapter(JSON.stringify([ACCOUNT])).forAccount(ACCOUNT_ID);

        expect(credentials).toEqual({
            username: ACCOUNT.username,
            password: ACCOUNT.password,
            sharedSecret: ACCOUNT.sharedSecret,
            identitySecret: ACCOUNT.identitySecret,
        });
    });

    it("Should have no accounts when the env has none", async () => {
        const credentials = new SteamCredentialsEnvAdapter(undefined).forAccount(ACCOUNT_ID);

        await expect(credentials).rejects.toThrow(SteamCredentialsNotFoundError);
    });

    it("Should reject accounts that aren't valid json", () => {
        const build = () => new SteamCredentialsEnvAdapter("{");

        expect(build).toThrow(InvalidSteamAccountsError);
    });

    it("Should name the invalid fields without echoing any secret", () => {
        const build = () => new SteamCredentialsEnvAdapter(JSON.stringify([{ ...ACCOUNT, sharedSecret: 1 }]));

        expect(build).toThrow('Invalid STEAM_ACCOUNTS: "0.sharedSecret"');
    });

    it("Should never put a secret in its errors", () => {
        const build = () => new SteamCredentialsEnvAdapter(`[{"password":"${PASSWORD}"`);

        expect(build).not.toThrow(PASSWORD);
    });
});
