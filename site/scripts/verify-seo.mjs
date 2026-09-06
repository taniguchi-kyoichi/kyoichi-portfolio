// SEO の土台が保たれているかを、宣言ではなく現物で確かめる。
//
// **壊れ方が静かなのが厄介なところ。** ページは 200 で返り、見た目も正しく、ビルドも通る。
// にもかかわらず、GitHub の README をそのまま流し込んでいたせいで `[LICENSE](LICENSE)` が
// `/oss/LICENSE` として解決され、存在しない URL への内部リンクが 35 ページ全部から
// 張られていた。2026-09-06 時点で Search Console の「未登録 37 件」のうち 31 件がこれ。
//
// 何を見るか:
//   1. sitemap の全 URL が 200・インデックス可能・lastmod あり
//   2. サイト内リンクと画像の宛先が全部 200（README 書き換えの退行検出）
//   3. 存在しない URL が 404 かつ noindex で canonical を出していない
//   4. robots メタが 1 ページ 1 つ（app.html と layout の二重出力の再発検出）
//   5. <h1> が 1 ページ 1 つ（README の `#` がページの h1 と重複していた）
//   6. title が検索結果の幅に収まっている（35 件中 28 件が切れていた）
//   7. www が apex へ、http が https へ恒久リダイレクトする
//   8. .md 版が noindex（HTML ページと同内容なので重複になる）
//
// **全リクエストにキャッシュ回避のクエリを付ける。** 見たいのは「いま配ったコードの
// 振る舞い」であって「CDN が追いついたか」ではない。付けないとデプロイ直後はエッジの
// 古い版を検査してしまう（実際 CD が 8 秒後に古い HTML を見て落ちた）。ホスト正規化も
// ページ生成もクエリに依存しないので、これで判定は変わらない。
//
// 使い方: node scripts/verify-seo.mjs [origin]

const ORIGIN = process.argv[2] ?? "https://taniguchi-kyoichi.com";
const CONCURRENCY = 6;
const MISSING_PATH = "/oss/__verify-seo-does-not-exist__";
const TITLE_BUDGET = 62;

const stamp = process.hrtime.bigint().toString(36);
let counter = 0;
const bust = (url) => `${url}${url.includes("?") ? "&" : "?"}__seo=${stamp}${counter++}`;

async function get(url, init) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await fetch(bust(url), { ...init, headers: { "cache-control": "no-cache" } });
    } catch (err) {
      if (attempt === 1) {
        return { status: 0, headers: new Headers(), text: async () => `${err}` };
      }
    }
  }
}

/** 同時実行数を絞って map する。本番に対して数十本を一度に開かない。 */
async function pooled(items, worker) {
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (cursor < items.length) await worker(items[cursor++]);
    })
  );
}

/** 検索結果に出るのは実体参照を解いた後の文字列。数える前に戻す。 */
const decodeEntities = (text) =>
  text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

/** 半角=1 / 全角=2。src/lib/seo.ts の displayWidth と同じ数え方。 */
const displayWidth = (text) =>
  [...text].reduce((n, c) => n + (/[\x00-\xFF｡-ﾟ]/.test(c) ? 1 : 2), 0);

const robotsOf = (html) =>
  [...html.matchAll(/<meta\s+name="robots"\s+content="([^"]*)"/gi)].map((m) => m[1]);
const canonicalOf = (html) => html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? null;

const failures = [];
const fail = (message) => failures.push(message);
const short = (url) => url.replace(ORIGIN, "") || "/";

// ---- 1. sitemap -------------------------------------------------------------

const sitemapRes = await get(`${ORIGIN}/sitemap.xml`);
if (sitemapRes.status !== 200) {
  console.error(`sitemap.xml が ${sitemapRes.status}。ここが取れないと以降が検査できない`);
  process.exit(1);
}

const entries = [...(await sitemapRes.text()).matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
  loc: m[1].match(/<loc>([^<]+)<\/loc>/)?.[1] ?? null,
  lastmod: m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? null
}));
if (entries.length === 0) {
  console.error("sitemap に <url> が 1 件も無い。生成が壊れている（空振りする方が危ない）");
  process.exit(1);
}

// lastmod が無いとクローラは「いつ変わったか」を判断できない。Google は changefreq /
// priority を無視するので、ここが唯一の更新シグナルになる。
const missingLastmod = entries.filter((e) => !e.lastmod).length;
if (missingLastmod > 0) fail(`sitemap の ${missingLastmod}/${entries.length} 件に <lastmod> が無い`);

// <loc> は常に本番 URL（sitemap の仕様）。検査対象の origin へ寄せ直して、
// ローカルや preview に対しても同じ検査が回るようにする。
const toOrigin = (loc) => `${ORIGIN}${new URL(loc).pathname}`.replace(/\/$/, "") || ORIGIN;
const pages = entries.map((e) => e.loc).filter(Boolean).map(toOrigin);

// ---- 2. 各ページと、そこから張られたリンク・画像の宛先 -----------------------

// /ask は noindex なので sitemap に載せていないが、リンクは張っているので対象に含める。
const crawlTargets = [...new Set([...pages, `${ORIGIN}/ask`])];
const linkSources = new Map();

await pooled(crawlTargets, async (url) => {
  const res = await get(url);
  if (res.status !== 200) {
    fail(`${short(url)} が ${res.status}（sitemap に載せた URL は 200 でなければならない）`);
    return;
  }
  const body = await res.text();

  const robots = robotsOf(body);
  if (robots.length !== 1) {
    fail(`${short(url)} の robots メタが ${robots.length} 個: ${JSON.stringify(robots)}`);
  }
  const indexable = !robots.some((r) => /noindex/i.test(r));
  if (pages.includes(url) && !indexable) fail(`${short(url)} は sitemap に載っているのに noindex`);
  if (url === `${ORIGIN}/ask` && indexable) fail("/ask は薄い JS ページなので noindex のままにする");
  if (indexable && !canonicalOf(body)) fail(`${short(url)} に canonical が無い`);

  const h1 = [...body.matchAll(/<h1[\s>]/g)].length;
  if (h1 !== 1) fail(`${short(url)} の <h1> が ${h1} 個（1 個であるべき）`);

  const title = decodeEntities(body.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? "");
  if (displayWidth(title) > TITLE_BUDGET) {
    fail(`${short(url)} の title が ${displayWidth(title)} 幅（上限 ${TITLE_BUDGET}）: ${title}`);
  }

  for (const raw of [
    ...[...body.matchAll(/href="([^"]+)"/g)].map((m) => m[1]),
    ...[...body.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1])
  ]) {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(raw)) continue;
    let target;
    try {
      target = new URL(raw, url);
    } catch {
      continue;
    }
    if (target.origin !== new URL(ORIGIN).origin) continue;
    target.searchParams.delete("__seo");
    const key = target.href.split("#")[0].replace(/\?$/, "");
    if (!linkSources.has(key)) linkSources.set(key, new Set());
    linkSources.get(key).add(url);
  }
});

// **サイト内リンクが 404 を指しているのは、静かに効き続ける損。** 見た目には出ず、
// クロール予算と内部リンクの評価だけが存在しない先へ流れ続ける。
const targets = [...linkSources.keys()];
await pooled(targets, async (url) => {
  const res = await get(url);
  if (res.status === 200) return;
  const from = [...linkSources.get(url)].map(short);
  fail(
    `内部リンクの宛先 ${short(url)} が ${res.status}` +
      `（${from.length} ページから被リンク: ${from.slice(0, 5).join(", ")}${from.length > 5 ? " ほか" : ""}）`
  );
});

// ---- 3. 存在しない URL の扱い ------------------------------------------------

const missing = await get(`${ORIGIN}${MISSING_PATH}`);
if (missing.status !== 404) {
  fail(`存在しない URL が ${missing.status} を返した（404 であるべき）`);
} else {
  const body = await missing.text();
  if (!robotsOf(body).some((r) => /noindex/i.test(r))) fail("404 ページが noindex を出していない");
  if (canonicalOf(body)) fail("404 ページが canonical を出している（自分を正規 URL だと主張してしまう）");
}

// ---- 4. ホストの正規化と .md 版の扱い ----------------------------------------

// 本番以外（ローカル・preview）には www も http も存在しないので飛ばす。
if (new URL(ORIGIN).host === "taniguchi-kyoichi.com") {
  for (const variant of ["http://taniguchi-kyoichi.com/", "https://www.taniguchi-kyoichi.com/"]) {
    const res = await get(variant, { redirect: "manual" });
    const location = res.headers.get("location");
    if (![301, 308].includes(res.status) || !location?.startsWith(`${ORIGIN}/`)) {
      fail(
        `${variant} が ${res.status} → ${location ?? "(リダイレクトなし)"}（apex へ恒久リダイレクトすべき）`
      );
    }
  }
}

// .md は HTML ページと同内容を配る LLM 向けの別表現。検索に出すと重複になる。
const mdSamples = pages
  .filter((u) => /\/(oss|products)\/[^/]+$/.test(u))
  .slice(0, 2)
  .map((u) => `${u}.md`);
for (const url of mdSamples) {
  const res = await get(url);
  if (res.status !== 200) fail(`${short(url)} が ${res.status}`);
  else if (!/noindex/i.test(res.headers.get("x-robots-tag") ?? "")) {
    fail(`${short(url)} に X-Robots-Tag: noindex が無い`);
  }
}

// ---- 結果 -------------------------------------------------------------------

console.log(
  `検査: sitemap ${entries.length} 件 / クロール ${crawlTargets.length} ページ / 内部リンク宛先 ${targets.length} 件`
);

if (failures.length > 0) {
  console.error(`\n${failures.length} 件の問題:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log("問題なし。");
