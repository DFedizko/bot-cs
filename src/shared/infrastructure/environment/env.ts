export interface Env {
    parse(source: Record<string, string | undefined>): AppEnv;
}
