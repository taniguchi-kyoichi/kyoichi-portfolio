// SEO の土台が本番で保たれているかを、宣言ではなく現物で確かめる。
//
// **壊れ方が静かなのが厄介なところ。** ページは 200 で返り、見た目も正しく、
// ビルドも通る。にもかかわらず、GitHub の README をそのまま流し込んでいたせいで
// `[LICENSE](LICENSE)` が `/oss/LICENSE` として解決され、存在しない URL への
// 内部リンクが 35 ページ全部から張られていた。2026-09-06 時点で Search Console の
// 「未登録 37 件」のうち 31 件がこれで生まれた 404 だった。
//
// 何を見るか:
//   1. sitemap の全 URL が 200 で、インデックス可能で、lastmod を持っているか
//   2. サイト内リンク・画像の宛先が全部 200 か（README 書き換えの退行検出）
//   3. 存在しない URL が 404 かつ noindex で、canonical を出していないか
//   4. robots メタが 1 ページに 1 つだけか（app.html と layout の二重出力の再発検出）
//
// 使い方: node scripts/verify-seo.mjs [origin]

const ORIGIN = process.argv[2] ?? "https://taniguchi-kyoichi.com";
const CONCURRENCY = 6;
const MISSING_URL = `${ORIGIN}/oss/__verify-seo-does-not-exist__`;

const failures = [];
const fail = (message) => failures.push(message);

async function get(url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { headers: { "cache-control": "no-cache" } });
      return { status: res.status, body: await res.text() };
    } catch (err) {
      if (attempt === 1) return { status: 0, body: "", error: String(err) };
    }
  }
}

/** 同時実行数を絞って map する。本番に対して数十本を一度に開かない。 */
async function pooled(items, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (cursor < items.length) {
        const i = cursor++;
        results[i] = await worker(items[i], i);
      }
    })
  );
  return results;
}

const robotsOf = (html) => [...html.matchAll(/<meta\s+name="robots"\s+content="([^"]*)"/gi)].map((m) => m[1]);
const canonicalOf = (html) => html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? null;

// ---- 1. sitemap -------------------------------------------------------------

const sitemap = await get(`${ORIGIN}/sitemap.xml`);
if (sitemap.status !== 200) {
  console.error(`sitemap.xml が ${sitemap.status}。ここが取れないと以降が検査できない`);
  process.exit(1);
}

const entries = [...sitemap.body.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
  loc: m[1].match(/<loc>([^<]+)<\/loc>/)?.[1] ?? null,
  lastmod: m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? null,
}));

if (entries.length === 0) {
  console.error("sitemap に <url> が 1 件も無い。生成が壊れている（検査が空振りする方が危ない）");
  process.exit(1);
}

// lastmod が無いと、クローラは「いつ変わったか」を判断する材料を持たない。
// Google は changefreq / priority を無視するので、ここが唯一の更新シグナルになる。
const withoutLastmod = entries.filter((e) => !e.lastmod);
if (withoutLastmod.length > 0) {
  fail(`sitemap の ${withoutLastmod.length}/${entries.length} 件に <lastmod> が無い`);
}

// <loc> は常に本番 URL を書く（sitemap の仕様）。検査対象の origin へ寄せ直して、
// ローカルや preview デプロイに対しても同じ検査が回るようにする。
const toOrigin = (loc) => `${ORIGIN}${new URL(loc).pathname}`.replace(/\/$/, "") || ORIGIN;
const pages = entries.map((e) => e.loc).filter(Boolean).map(toOrigin);

// ---- 2. sitemap の各ページ + サイト内リンクの宛先 ----------------------------

// /ask は noindex なので sitemap に載せていないが、リンクは張っているのでクロール対象。
const crawlTargets = [...new Set([...pages, `${ORIGIN}/ask`])];
const linkSources = new Map(); // 宛先 URL -> それを張っているページ

const fetched = await pooled(crawlTargets, async (url) => {
  const res = await get(url);
  return { url, ...res };
});

for (const { url, status, body } of fetched) {
  if (status !== 200) {
    fail(`${url} が ${status}（sitemap に載せた URL は 200 でなければならない）`);
    continue;
  }

  const robots = robotsOf(body);
  if (robots.length !== 1) {
    fail(`${url} の robots メタが ${robots.length} 個（1 個であるべき）: ${JSON.stringify(robots)}`);
  }

  const indexable = !robots.some((r) => /noindex/i.test(r));
  if (pages.includes(url) && !indexable) {
    fail(`${url} は sitemap に載っているのに noindex`);
  }
  if (url === `${ORIGIN}/ask` && indexable) {
    fail(`/ask は薄い JS ページなので noindex のままにする（今 index 可能になっている）`);
  }
  if (indexable && !canonicalOf(body)) {
    fail(`${url} に canonical が無い`);
  }

  for (const raw of [
    ...[...body.matchAll(/href="([^"]+)"/g)].map((m) => m[1]),
    ...[...body.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]),
  ]) {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(raw)) continue;
    let target;
    try {
      target = new URL(raw, url);
    } catch {
      continue;
    }
    if (target.origin !== new URL(ORIGIN).origin) continue;
    const key = target.href.split("#")[0];
    if (!linkSources.has(key)) linkSources.set(key, new Set());
    linkSources.get(key).add(url);
  }
}

const targets = [...linkSources.keys()];
const statuses = await pooled(targets, async (url) => ({ url, status: (await get(url)).status }));

// **サイト内リンクが 404 を指しているのは、静かに効き続ける損。** 見た目には出ず、
// クロール予算と内部リンクの評価だけが存在しない先へ流れ続ける。
for (const { url, status } of statuses) {
  if (status === 200) continue;
  const from = [...linkSources.get(url)].map((u) => u.replace(ORIGIN, "") || "/");
  fail(
    `内部リンクの宛先 ${url.replace(ORIGIN, "")} が ${status}` +
      `（${from.length} ページから被リンク: ${from.slice(0, 5).join(", ")}${from.length > 5 ? " ほか" : ""}）`
  );
}

// ---- 3. 存在しない URL の扱い ------------------------------------------------

const missing = await get(MISSING_URL);
if (missing.status !== 404) {
  fail(`存在しない URL が ${missing.status} を返した（404 であるべき）`);
} else {
  if (!robotsOf(missing.body).some((r) => /noindex/i.test(r))) {
    fail("404 ページが noindex を出していない");
  }
  if (canonicalOf(missing.body)) {
    fail("404 ページが canonical を出している（自分自身を正規 URL だと主張してしまう）");
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
