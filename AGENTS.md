# AGENTS.md — taniguchi-kyoichi.com（cloud-hub モノレポ）

**taniguchi-kyoichi.com 個人クラウドハブのモノレポ**。公開ポートフォリオ(site) + 認証付き知識基盤(api/mcp) を1ドメインに束ねる。
設計 SSOT: `life/projects/cloud-hub/architecture.md`（親）+ `life/projects/life-index/cloud-architecture.md`（子）。移行手順: `MIGRATION.md`。

## 構成（bun workspace）

```
site/              公開 SvelteKit（Cloudflare Workers Static Assets）— apex + www
api/               KB API Worker（D1 FTS5 trigram + Vectorize bge-m3 + Workers AI・Access JWT gate）— api.
mcp/               remote MCP Worker（McpAgent DO → api へ service binding）— mcp.
app/               Life Mirror ダッシュボード（React SPA + /api/* を api へプロキシ）— app.（Access SSO）
ingest/            life の .md → bge-m3 埋め込み → D1+Vectorize upsert（ローカル/CI・op run）
packages/shared/   D1 schema.sql / bge-m3 embed / Vectorize検索+RRF / Access JWKS 検証
```

## ingest（H2・検索データ投入）

```
op run --env-file=.env.cloudflare.tpl -- bun ingest/ingest.ts <file.md ...>
# 例: op run --env-file=.env.cloudflare.tpl -- bun ingest/ingest.ts /Users/kyoichi/life/projects/cloud-hub/*.md
```
- life の .md をパース→チャンク(見出し境界+1500字)→Workers AI `@cf/baai/bge-m3`(1024)で埋め込み→**D1**(doc/doc_fts/heading/chunk)+**Vectorize**(id=`sha1(path)#ord`, metadata{path,heading})へ upsert。path 単位で冪等(全消し→入れ直し)。
- **公開 Worker に書込口は開けない**。ingest は全てトークン(REST)で直書き。
- ⚠️ 全 ingest はチャンク毎の D1 REST + Workers AI neuron(無料 1万/日) を消費。大量時はバッチ最適化と日次分割を検討。

- パッケージマネージャ = **bun**（root が workspace、単一 `bun.lock`）。`bun install` を root で。
- 各 Worker は `wrangler`（v4）。`bun --filter @cloud-hub/<site|api|mcp> <dev|deploy|typecheck>`。

## Cloudflare 認証（重要・AI エージェントはこれを使う）

**デプロイ/DNS 用の API トークンは 1Password に格納**。秘密値をコードや .env に直書きしない。

- 格納先: 1Password **Infra-CICD** vault / item **`cloud-hub deploy taniguchi-kyoichi.com`** / field `credential`
- 参照（単発）: `op read "op://Infra-CICD/cloud-hub deploy taniguchi-kyoichi.com/credential"`
- 参照（コマンド実行）: `op run --env-file=.env.cloudflare.tpl -- wrangler deploy`
  （`.env.cloudflare.tpl` が `CLOUDFLARE_API_TOKEN` を op 参照で注入。wrangler は自動で読む）
- スコープ: Account = Workers Scripts / D1 / Vectorize / Workers AI（編集）、Zone(taniguchi-kyoichi.com) = DNS / Workers Routes（編集）
- Account ID: `4a8cea39f86248f053042ff4bf02c172` / Zone ID: `d3c2a2c40f9e24c540d975b6ab2c89d9`
- DNS/custom domain の API 操作（wrangler で不足時）はこのトークンで REST を叩く（例: custom domain 付替、レコード削除）。

> ローカルの `wrangler login`(OAuth) は DNS 権限が無い。DNS/custom domain 操作は必ず上記トークン(`op run`)で行う。

## デプロイ

```
# site（apex + www・Workers Static Assets）
op run --env-file=.env.cloudflare.tpl -- bash -c 'cd site && bun run build && wrangler deploy'
# api / mcp（Access 設定は life/projects/cloud-hub/zero-trust-runbook.md）
op run --env-file=.env.cloudflare.tpl -- bash -c 'cd api && wrangler deploy'
op run --env-file=.env.cloudflare.tpl -- bash -c 'cd mcp && wrangler deploy'
```

デプロイ後は **incognito で apex 200 スモーク**（Access に apex を飲ませない）:
`curl -sI https://taniguchi-kyoichi.com | head -1  # → HTTP/2 200`

## ⚠️ site が依存する binding / secret（落とすと機能が消える）

**Pages→Workers 移行で一度これらを落とし、AskAI と YouTube が本番から消えた**（2026-07-04・要因=古い checkout を deploy + binding/secret 未移設）。以後は必ず維持:

- **binding（`site/wrangler.jsonc` に記載・コミット済）**:
  - `ai` → `AI`（Workers AI・AskAI `/ask`,`/api/chat` の推論。APIキー不要）
  - `kv_namespaces` → `CHAT_LIMITS`(`e1a0f7df4862482fb2cd1e9c40c4e84b`)（`/api/chat` のレート制限）
  - `compatibility_date=2025-04-01` + `nodejs_compat`（AI SDK の AsyncLocalStorage）
- **AskAI のコード側の前提（外すと「回答が返ってこない」が再発する）**:
  - `site/src/lib/server/aiBinding.ts` の `withoutDuplicatedChunks()` で binding を包む。Workers AI は 1 チャンクに同じ内容を native(`response`/`tool_calls`) と OpenAI(`choices[0].delta`) の両スロットへ入れて返し、workers-ai-provider が両方写すため、**外すとテキストが 2 重になり tool 引数が `{}{}` になって全 tool 呼び出しが落ちる**（provider 3.2.1〜4.0.0 で未修正。上流を直すまで必要）
  - tool の `inputSchema` は `tools.ts` の `toolInput()` を通す。AI SDK の zod 変換が付ける `$schema` キーが入ると **Llama 4 Scout が空の completion を返す**（テキストも tool 呼び出しも無し・エラーも出ない）
  - システムプロンプトと tool スキーマは短く保つ。Scout はプロンプト重量が増えると同じ空応答に落ちる
  - 変更したら 7 問スモーク（人物 / アプリ / OSS / 連絡 / 記事 / 動画 / 英語）で **tool-output-available が出ること**まで確認する。`/api/chat` を curl すると生の SSE が読める
- **secret（Worker にサーバ側保管・wrangler.jsonc には出ない。デプロイでは消えないが、Worker 再作成時は再投入）**:
  - `YOUTUBE_API_KEY`（ホーム/AI の YouTube 動画。無いと `getVideos` が空配列）。値は 1Password `op://Prod-Apps/kyoichi-portfolio YouTube Data API/credential`
  - **api の `INTERNAL_SECRET`**（service binding mcp→api の共有シークレット。`X-Internal-Service` ヘッダ照合値。無い/不一致は Access JWT が要る）。値は 1Password `op://Infra-CICD/cloud-hub api INTERNAL_SECRET/credential`。**api と mcp の両 Worker に同値を投入**。固定値バイパス(`:1`)は塞ぎ済み
  - **mcp の `MCP_AUTH_SECRET`**（remote MCP エンドポイントの bearer ゲート。`Authorization: Bearer <値>`）。値は 1Password `op://Infra-CICD/cloud-hub mcp MCP_AUTH_SECRET/credential`。Access/Managed OAuth を張るまでの認証。mcp Worker secret に投入済み
  - **api の `GITHUB_TOKEN`**（board #2 の read。`/api/board` が GitHub Projects v2 を GraphQL で読む）。値は 1Password `op://Infra-CICD/cloud-hub api GITHUB_TOKEN/credential`（no-problem-kyoichi PAT・project+repo scope）。api Worker secret。**read 専用の流用**（将来 fine-grained read-only PAT へ差替可）。無いと `/api/board` は 503（Home は board 無しで描画継続）
  - 再設定: `cd site && op read "op://Prod-Apps/kyoichi-portfolio YouTube Data API/credential" | op run --env-file=../.env.cloudflare.tpl -- wrangler secret put YOUTUBE_API_KEY`
  - 確認: `cd site && op run --env-file=../.env.cloudflare.tpl -- wrangler secret list`
- **`git pull` してから作業**（このリポは main が SSOT。古い checkout に restructure を積むと本番を巻き戻す）。

## 状態（2026-07-04）

- site = Pages→Workers 移行 **完了・稼働中**（apex+www が cloud-hub-site Worker で 200）。**最新 main + AskAI + YouTube 全て動作確認済み**。旧 Pages プロジェクト `kyoichi-portfolio` 削除済み。AskAI は 7 問スモークで全問 tool 実行成功・カード表示まで本番確認済み（前提は上の ⚠️ 節）。
- **api = デプロイ済み・稼働中**（`api.taniguchi-kyoichi.com`）: D1 `life-index`(id `cc2716ad-ea90-4d67-896b-04cf804f8c9c`, schema 適用・trigram 実 D1 で検証済) + Vectorize `life-index`(1024/cosine) + Workers AI 結線。`/health` 200・`/api/*` は Access JWT ゲート(401)・`X-Internal-Service:1` で service binding 経路(200)。**ACCESS_AUD は placeholder**（Zero Trust 設定で実 AUD を入れて再 deploy）。
- **H2 ingest 実施済み（コアスコープ）**: `ingest/scope.ts` の宣言的スコープ = **knowledge/ + content/ + .claude/contexts/**（archived / frontmatter `searchable:false` 除外）。141文書/1723チャンクを bge-m3 で D1+Vectorize へ投入。**FTS/semantic/hybrid が実データで本番動作確認済み**。高価な埋め込み層はコアに限定、範囲外は非semantic手段でカバーする方針。
- **mcp = デプロイ済み・稼働中**（`mcp.taniguchi-kyoichi.com/mcp`）: McpAgent(DO) → service binding → api。tools=search/get/outline/list/facets（related は api の /api/related 実装後に追加）。**bearer ゲート**（`MCP_AUTH_SECRET`）。initialize/tools/list/tools/call を実データで確認済み。
  - **Claude から使う**: remote MCP に URL `https://mcp.taniguchi-kyoichi.com/mcp` + header `Authorization: Bearer <op://Infra-CICD/cloud-hub mcp MCP_AUTH_SECRET/credential>` を設定。
- **app（Life Mirror ダッシュボード）= デプロイ済み・稼働中**（`app.taniguchi-kyoichi.com`）: React SPA + `/api/*` を service binding で api へプロキシ（INTERNAL_SECRET）。**Cloudflare Access(Zero Trust Free) の `only-me` ポリシー（administrator@taniguchi-kyoichi.com のみ）で SSO ログイン保護**。未認証は Access ログインへ 302。`/api/home`（Life Mirror データ）は buildHome を D1 移植。
  - Zero Trust: チーム `damp-lab-3e2a`（`damp-lab-3e2a.cloudflareaccess.com`）。ログイン方法は現状 One-time PIN（IdP 未接続）。Google Workspace SSO にしたい場合は IdP を追加。
- **次（任意）**: Google Workspace IdP 接続（Google SSO ボタン化）／api/mcp に Access+実 AUD（現状は INTERNAL_SECRET/bearer で保護済み）／差分 ingest の GitHub Action 化。
- 再 ingest: `LIFE_ROOT=/Users/kyoichi/life op run --env-file=.env.cloudflare.tpl -- bun ingest/ingest.ts --scope`（path 単位冪等）。
