# End-to-end tests (Playwright)

End-to-end tests prove that the **happy path of each main feature** works in a real browser, from the user's first click to the result on screen. Edge cases, validation errors and API failures belong to the integration tests in `web/test/`, not here.

## Running

`bun run test:e2e` starts the Vite dev server (port 5173) and runs every `e2e/**/*.e2e.ts` in Chromium (`playwright.config.ts`). The `.e2e.ts` suffix keeps these files out of Bun's runner.

When a journey needs the bot, run it against the bot in **development** mode, where its gateways are dry-run adapters: an e2e test must never place a real bid, withdraw an item or touch a real trade. Never point e2e tests at production.

## Writing them

- One file per main feature, named after the journey: `wanted-items.e2e.ts`, with one `test` per happy path (`Should add a wanted item and see it in the list`).
- Locate elements by role, label or text (`page.getByRole("button", { name: "Save" })`), as users do.
- Use web-first assertions (`await expect(locator).toBeVisible()`); never fixed waits (`waitForTimeout`).
- Each test is independent: it creates the data it needs through the UI or the bot's API, and doesn't rely on another test's data or order.
- Repeated steps (log in, open an account) become functions named after their files in `e2e/__steps__/` (`open-account.ts` → `openAccount`).
