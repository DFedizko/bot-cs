---
name: steam-integration
description: Steam libraries, docs and reference code for the bot. Use it whenever a task touches Steam in any way — logging in an account, steam-user sessions, trade offers (listing, polling, accepting, cancelling), mobile confirmations, 2FA codes, escrow or inventories — including the delivery context's Steam adapters and their fakes.
---

# Steam integration

The delivery context's safety rules (`src/contexts/delivery/CLAUDE.md`) always apply to trades.

## Libraries

Node libraries, used through adapters in `external/` only:

- [`steam-user`](https://github.com/DoctorMcKay/node-steam-user): Steam client login and session (web cookies).
- [`steamcommunity`](https://github.com/DoctorMcKay/node-steamcommunity): community session, mobile trade confirmations (`acceptConfirmationForObject`).
- [`steam-tradeoffer-manager`](https://github.com/DoctorMcKay/node-steam-tradeoffer-manager): list, poll, accept and cancel trade offers (`newOffer`, `pollInterval`, `getOffers`, `offer.accept`, `offer.getUserDetails` for escrow).
- [`steam-totp`](https://github.com/DoctorMcKay/node-steam-totp): 2FA login codes from `shared_secret`, confirmation keys from `identity_secret`.

Docs and Q&A: the libraries' GitHub wikis and `https://dev.doctormckay.com` (rate limits, polling). Take behaviour from these docs, never from memory.

## Reference bot

[`kevalane/csgoempire-bot`](https://github.com/kevalane/csgoempire-bot) is a small CSGOEmpire + Steam trading bot (`src/lib/SteamBot.ts` for the Steam session and trade actions, `src/services/` for the buy/sell flows). Use it to understand behaviour only: it is procedural, single-account and untested, so never copy its structure; this repo's architecture and rules always apply.
