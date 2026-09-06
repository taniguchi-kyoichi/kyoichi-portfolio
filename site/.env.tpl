# 1Password reference template — resolved at runtime by `op run --env-file=.env.tpl`.
# Do NOT commit a `.env` file (gitignored). Run dev with `npm run dev`,
# which wraps `vite dev` with `op run` to inject env vars from 1Password.
#
# 本番は Worker の secret（`wrangler secret put`）から入る。このテンプレートは
# ローカル開発専用。

# YouTube Data API v3 — used by SvelteKit SSR in src/routes/+page.server.ts
YOUTUBE_API_KEY=op://Prod-Apps/kyoichi-portfolio YouTube Data API/credential
