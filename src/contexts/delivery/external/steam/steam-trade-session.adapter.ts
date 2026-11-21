import SteamUser from "steam-user";
import SteamCommunity from "steamcommunity";
import SteamTotp from "steam-totp";
import TradeOfferManager from "steam-tradeoffer-manager";
import type TradeOffer from "steam-tradeoffer-manager/lib/classes/TradeOffer";
import type CEconItem from "steamcommunity/classes/CEconItem";
import type { Logger } from "@/packages/application/logger";
import type { SteamLogin } from "../../infrastructure/steam/steam-login";
import type { SteamTradeSession } from "../../infrastructure/steam/steam-trade-session";
import type {
    SteamAcceptStatus,
    SteamEconItem,
    SteamOfferState,
    SteamTradeOffer,
} from "../../infrastructure/steam/steam-trade-offer";
import { SteamLoginError } from "./steam-login.error";
import type { SteamLoginPause } from "./steam-login-pause";
import type { SteamRetry } from "./steam-retry";

const LANGUAGE = "en";
const POLLING_DISABLED = -1;
const LOGIN_TIMEOUT_MS = 60_000;
const SESSION_ERRORS = /not logged in|notloggedon|session expired/i;
const STEAM_GUARD_REFUSED = "Steam Guard asked for a code the shared secret could not provide";
const LOGIN_TIMED_OUT = "Steam login timed out";
const LOGIN_PAUSED = "paused after a refused login";

type WebSessionHandler = (sessionId: string, cookies: string[]) => void;

type Executor<T> = (resolve: (value: T) => void, reject: (error: Error) => void) => void;

export class SteamTradeSessionAdapter implements SteamTradeSession {
    private readonly client = new SteamUser({ autoRelogin: false, dataDirectory: null });
    private readonly community = new SteamCommunity();
    private readonly manager = new TradeOfferManager({
        steam: this.client,
        community: this.community,
        language: LANGUAGE,
        useAccessToken: true,
        pollInterval: POLLING_DISABLED,
        dataDirectory: null,
    });
    private session?: Promise<void>;
    private refuseLogin?: (error: Error) => void;

    constructor(
        private readonly login: SteamLogin,
        private readonly logger: Logger,
        private readonly retry: SteamRetry,
        private readonly pause: SteamLoginPause,
    ) {
        this.client.on("error", (error) => this.onClientError(error));
        this.client.on("steamGuard", () => this.refuseLogin?.(new SteamLoginError(STEAM_GUARD_REFUSED)));
        this.client.on("disconnected", () => this.forgetSession());
        this.manager.on("sessionExpired", () => this.forgetSession());
    }

    getReceivedActiveOffers(): Promise<SteamTradeOffer[]> {
        return this.withSession(async () => {
            const offers = await this.promise<TradeOffer[]>((resolve, reject) =>
                this.manager.getOffers(TradeOfferManager.EOfferFilter.ActiveOnly, (error, _sent, received) =>
                    error ? reject(error) : resolve(received),
                ),
            );
            return Promise.all(offers.map((offer) => this.mapToContract(offer)));
        });
    }

    async getOfferState(offerId: string): Promise<SteamOfferState> {
        const offer = await this.withSession(() => this.findOffer(offerId));
        return offer.state as SteamOfferState;
    }

    async acceptOffer(offerId: string): Promise<SteamAcceptStatus> {
        const offer = await this.withSession(() => this.findOffer(offerId));
        return this.promise<SteamAcceptStatus>((resolve, reject) =>
            offer.accept(false, (error, status) => (error ? reject(error) : resolve(status))),
        );
    }

    async cancelOffer(offerId: string): Promise<void> {
        const offer = await this.withSession(() => this.findOffer(offerId));
        await this.promise<void>((resolve, reject) => offer.decline((error) => (error ? reject(error) : resolve())));
    }

    confirmOffer(offerId: string): Promise<void> {
        return this.withSession(() =>
            this.promise<void>((resolve, reject) =>
                this.community.acceptConfirmationForObject(this.login.identitySecret, offerId, (error) =>
                    error ? reject(error) : resolve(),
                ),
            ),
        );
    }

    private withSession<T>(action: () => Promise<T>): Promise<T> {
        return this.retry.run(
            async () => {
                await this.ensureSession();
                return action();
            },
            (error) => this.forgetExpiredSession(error),
        );
    }

    private ensureSession(): Promise<void> {
        if (this.pause.isPaused()) return Promise.reject(new SteamLoginError(LOGIN_PAUSED));
        this.session ??= this.logIn().catch((error: Error) => this.onLoginRefused(error));
        return this.session;
    }

    private logIn(): Promise<void> {
        let onWebSession: WebSessionHandler = () => {};
        let timeout: ReturnType<typeof setTimeout> | undefined;
        return this.promise<void>((resolve, reject) => {
            timeout = setTimeout(() => reject(new Error(LOGIN_TIMED_OUT)), LOGIN_TIMEOUT_MS);
            this.refuseLogin = reject;
            onWebSession = (_sessionId, cookies) => this.useCookies(cookies).then(resolve, reject);
            this.client.once("webSession", onWebSession);
            this.startLogOn();
        }).finally(() => {
            clearTimeout(timeout);
            this.client.removeListener("webSession", onWebSession);
            this.refuseLogin = undefined;
        });
    }

    private startLogOn(): void {
        if (this.client.steamID) return this.client.webLogOn();
        this.client.logOff();
        this.client.logOn({
            accountName: this.login.accountName,
            password: this.login.password,
            twoFactorCode: SteamTotp.generateAuthCode(this.login.sharedSecret),
        });
    }

    private onLoginRefused(error: Error): never {
        this.forgetSession();
        this.client.logOff();
        this.pause.pauseAfter(error);
        this.logger.log(`Steam login of "${this.login.accountName}" failed: ${error.message}`);
        throw error instanceof SteamLoginError ? error : new SteamLoginError(error.message);
    }

    private useCookies(cookies: string[]): Promise<void> {
        this.community.setCookies(cookies);
        return this.promise<void>((resolve, reject) =>
            this.manager.setCookies(cookies, (error) => (error ? reject(error) : resolve())),
        );
    }

    private findOffer(offerId: string): Promise<TradeOffer> {
        return this.promise<TradeOffer>((resolve, reject) =>
            this.manager.getOffer(offerId, (error, offer) => (error ? reject(error) : resolve(offer))),
        );
    }

    private async mapToContract(offer: TradeOffer): Promise<SteamTradeOffer> {
        return {
            id: offer.id ?? "",
            partner: offer.partner.getSteamID64(),
            state: offer.state as SteamOfferState,
            message: offer.message,
            itemsToGive: offer.itemsToGive.map((item) => this.mapItem(item)),
            itemsToReceive: offer.itemsToReceive.map((item) => this.mapItem(item)),
            isOurOffer: offer.isOurOffer,
            isGlitched: offer.isGlitched(),
            escrowDays: await this.escrowDaysOf(offer),
        };
    }

    private escrowDaysOf(offer: TradeOffer): Promise<number> {
        return this.promise<number>((resolve, reject) =>
            offer.getUserDetails((error, me, them) =>
                error ? reject(error) : resolve(Math.max(me.escrowDays, them.escrowDays)),
            ),
        );
    }

    private mapItem(item: CEconItem): SteamEconItem {
        return {
            assetid: String(item.assetid),
            appid: Number(item.appid),
            contextid: String(item.contextid),
            classid: String(item.classid),
            instanceid: String(item.instanceid),
            amount: item.amount,
            name: item.name,
            market_hash_name: item.market_hash_name,
        };
    }

    private onClientError(error: Error): void {
        this.logger.log(`Steam client error for "${this.login.accountName}": ${error.message}`);
        this.refuseLogin?.(error);
        this.forgetSession();
    }

    private forgetExpiredSession(error: Error): void {
        if (SESSION_ERRORS.test(error.message)) this.forgetSession();
    }

    private forgetSession(): void {
        this.session = undefined;
    }

    private promise<T>(executor: Executor<T>): Promise<T> {
        return new Promise<T>(executor);
    }
}
