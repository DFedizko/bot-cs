export type SteamCredentialsDTO = {
    username: string;
    password: string;
    sharedSecret: string;
    identitySecret: string;
};

export interface SteamCredentials {
    forAccount(accountId: number): Promise<SteamCredentialsDTO>;
}
