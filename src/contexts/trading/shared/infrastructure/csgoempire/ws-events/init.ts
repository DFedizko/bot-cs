type CsgoempireKnownRole =
    "super-mod" | "tester" | "support-manager" | "root" | "matchbetting-beta" | "shark" | "admin" | "manager" | "mod";

type CsgoempireRole = CsgoempireKnownRole | (string & {});

type CsgoempireBalance = {
    user_id: number;
    balance_type: number;
    balance_type_name: string;
    balance: string;
    uncashoutable_balance: string;
    balance_coins: string;
    balance_coins_value: string;
    cashoutable_balance: string;
};

type CsgoempireInitBase = {
    serverTime: string;
    server: string;
    serverHost: string;
    identifying: boolean;
    roles: CsgoempireRole[];
    helper_mod: boolean;
    mod: boolean;
    super_mod: boolean;
    admin: boolean;
    qa: boolean;
    badge_text: string | null;
    badge_text_localized: string | null;
    badge_color: string | null;
    encuid: string | null;
};

export type CsgoempireInitGuest = CsgoempireInitBase & {
    authenticated: false;
    isGuest: true;
};

export type CsgoempireInitAuthenticated = CsgoempireInitBase & {
    authenticated: true;
    isGuest: false;
    id: number;
    uid: number;
    name: string;
    steam_name: string;
    avatar: string;
    balance: number;
    balances: CsgoempireBalance[];
    bet_threshold: number;
    total_bet: number;
    total_deposit: number;
    total_profit: number;
    withdraw_limit: number;
    deposited: boolean;
    lvl: number;
    ref_id: number;
    referral_code: string | null;
    utm_campaign: string;
    muted_until: number;
    mute_reason: string | null;
    whitelisted: boolean;
    registration_ip: string;
    registration_timestamp: string;
    chat_tag: string | null;
    badges: unknown[];
    hide_rank: boolean | null;
    steam_id?: string;
    verified?: boolean;
    hide_verified_icon?: boolean;
    profile_url?: string;
    is_vac_banned?: number;
    steam_level?: number;
};

export type InitEvent = CsgoempireInitGuest | CsgoempireInitAuthenticated;
