export interface SocketMetadataGateway {
    getSocketMetadata(): Promise<GetSocketMetadataIO.Response>;
}

export namespace GetSocketMetadataIO {
    export interface Response {
        user: CsgoempireUser;
        socket_token: string;
        socket_signature: string;
    }
}

type CsgoempireExtraCred = {
    user_id: number;
    credential_type: number;
    value: string;
    flags: number;
    created_at: string;
    updated_at: string;
    reminded_at: string;
};

type CsgoempireLevelsData = {
    user_id: number;
    level: number;
    rust_keys: number;
    bronze_keys: number;
    silver_keys: number;
    gold_keys: number;
    diamond_keys: number;
    uranium_keys: number;
    unbreakable_keys: number;
    gift_keys: number;
    created_at: string;
    updated_at: string;
    last_used_key_at: string | null;
    last_used_key: string | null;
    xp: number | null;
    xp_synced_at: string | null;
};

type CsgoempireUser = {
    id: number;
    username: string | null;
    steam_name: string;
    avatar: string;
    default_balance_type: number;
    registration_timestamp: string;
    registration_ip: string;
    last_login: string;
    total_profit: number;
    total_bet: number;
    betback_total: number;
    bet_threshold: number;
    total_trades: number;
    total_deposit: number;
    total_withdraw: number;
    withdraw_limit: number;
    ref_id: number;
    ref_earnings: number;
    total_ref_earnings: number;
    referral_code: string | null;
    muted_until: number;
    mute_reason: string | null;
    utm_campaign: string | null;
    country: string;
    whitelisted: number;
    total_tips_received: number;
    total_tips_sent: number;
    withdrawal_fee_owed: string;
    flags: number;
    public_uuid: string;
    badges: unknown[];
    tos_version: string;
    risk_factor: string;
    intercom_contact_id: string | null;
    balance: number;
    ban: unknown | null;
    extra_cred: CsgoempireExtraCred | null;
    levels_data: CsgoempireLevelsData | null;
    balances: unknown[];
    cashoutable_balance: number;
    steam_id: string;
    steam_level: number | null;
    last_steam_level_cache: string | null;
    trade_offer_token: string | null;
    trade_url: string | null;
    notifications: {
        discord: unknown | null;
        telegram: unknown | null;
    };
    level: number;
    xp: number;
    user_hash: string;
    roles: unknown[];
    eligible_for_free_case: boolean;
    extra_security_type: string;
    p2p_last_failed_trade_feedback: unknown | null;
    p2p_filter_delivery_time_enabled: boolean;
    steam_inventory_url: string;
    steam_api_key: string | null;
    balance_pending: number;
    unread_notifications: unknown[];
    password_updated_at: string | null;
    has_password: boolean;
    has_google: boolean;
    third_party_auth_provider_count: number;
    has_crypto_deposit: boolean;
    actualBan: unknown | null;
    all_deposits_blocked: boolean;
    fiat_deposits_blocked: boolean;
    all_withdrawals_blocked: boolean;
    crypto_withdrawals_blocked: boolean;
    instant_deposit_enabled: boolean;
    oauth_services: unknown[];
    referred_by_code: string | null;
    has_stolen_username: boolean;
    session: unknown | null;
    require_2fa: boolean;
    api_token: string;
};
