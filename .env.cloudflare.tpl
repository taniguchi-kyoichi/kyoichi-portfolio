# 1Password 参照テンプレート — `op run --env-file=.env.cloudflare.tpl -- <cmd>` で解決される。
# ここに書いてよいのは op:// 参照だけ（参照そのものは秘密ではない）。値は絶対に書かない。
#
# 使い方は AGENTS.md の「Cloudflare 認証」「デプロイ」を参照。
# スコープ: Account = Workers Scripts / D1 / Vectorize / Workers AI（編集）、
#          Zone(taniguchi-kyoichi.com) = DNS / Workers Routes（編集）

CLOUDFLARE_API_TOKEN=op://Infra-CICD/cloud-hub deploy taniguchi-kyoichi.com/credential
