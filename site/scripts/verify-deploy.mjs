// デプロイが本番に届いたかを、宣言ではなく現物で確かめる。
//
// **「マージした」と「本番がそうなっている」は別の性質。** このリポジトリには長いあいだ
// CD が無く、PR をマージしても誰かが手元で deploy を叩くまで本番は変わらなかった。
// 実際 2026-08-23 の時点で、本番は 8/8 より前の建物のままだった（ストックレーダーが
// `hidden: true` だった頃の版で、詳細ページはあるのにホームに出ない状態）。
//
// 何を見るか: **ソースが「出す」と言っている製品が、本番のホームに実在するか。**
// 版番号ではなく中身を見るので、ビルドは通ったが古い版が配られている場合も捕まる。
//
// 使い方: node scripts/verify-deploy.mjs [origin]

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ORIGIN = process.argv[2] ?? "https://taniguchi-kyoichi.com";
const ATTEMPTS = 6;
const DELAY_MS = 10_000;

const here = dirname(fileURLToPath(import.meta.url));
const source = await readFile(join(here, "..", "src", "lib", "data", "products.ts"), "utf8");

// products.ts から「ホームに出るはずの id」を拾う。hidden はルートを残したまま一覧から
// 外す指定なので、ここでは期待しない（buildInPublic は別セクションだが同じページに出る）。
const expected = [];
for (const block of source.split(/\n\t\{\n/).slice(1)) {
  const id = block.match(/id: *'([a-z0-9-]+)'/)?.[1];
  if (!id) continue;
  if (/hidden: *true/.test(block)) continue;
  expected.push(id);
}
if (expected.length === 0) {
  console.error("products.ts から id を1つも拾えなかった。抽出が壊れている（検査が空振りする方が危ない）");
  process.exit(1);
}

async function missingOn(origin) {
  const res = await fetch(origin, { headers: { "cache-control": "no-cache" } });
  if (!res.ok) throw new Error(`${origin} が ${res.status}`);
  const html = await res.text();
  return expected.filter((id) => !html.includes(`/products/${id}`));
}

// 反映はエッジに伝わるまで数秒かかる。数回だけ待ってから落とす（stock-radar の deploy と同じ作法）
let missing = expected;
for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
  try {
    missing = await missingOn(ORIGIN);
  } catch (error) {
    console.error(`取得に失敗（試行 ${attempt}/${ATTEMPTS}）: ${error.message}`);
    missing = expected;
  }
  if (missing.length === 0) {
    console.log(`✓ ${ORIGIN} に ${expected.length} 件すべて在中: ${expected.join(", ")}`);
    process.exit(0);
  }
  if (attempt < ATTEMPTS) {
    console.error(`まだ届いていない: ${missing.join(", ")}（試行 ${attempt}/${ATTEMPTS}・${DELAY_MS / 1000} 秒後に再試行）`);
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }
}

console.error(`✗ ${ORIGIN} のホームに出ていない: ${missing.join(", ")}`);
console.error("  ソースは出すと言っているのに本番に無い = 配られている建物が古い。deploy が走ったかを見る。");
process.exit(1);
