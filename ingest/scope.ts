// 検索対象（cloud semantic/FTS index）のスコープ定義 = 「何が検索対象たる知識か」の systematic な discern。
// 高価な埋め込み層はここに絞る。範囲外は非 semantic 手段（grep/直読/local tools）でカバーする方針。
// 変更はここ（宣言的）で行う。個別除外は各 .md の frontmatter `searchable: false`。
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import matter from 'gray-matter'

export const SCOPE = {
  // 検索対象に含めるトップレベル（life ルートからの接頭辞）。コア＝確定知識・記事・判断基盤 + 引用付き外部調査
  // + 発見ファネル(ideas) + キャリア + OSS カタログ + OS 自身の設計（被覆を全ドメインへ）。
  includeDirs: ['knowledge/', 'content/', '.claude/contexts/', 'research/', 'ideas/', 'career/', 'oss/', 'os/'],
  // status がこれらの doc は除外。
  excludeStatus: ['archived'],
  // frontmatter にこれが false の doc は個別に除外（逃げ道）。
  optOutField: 'searchable',
}

/** git 追跡 .md のうち、SCOPE に合致する相対パス一覧を返す。 */
export function selectScopedFiles(lifeRoot: string): string[] {
  const tracked = execFileSync('git', ['-C', lifeRoot, 'ls-files', '*.md'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split('\n').filter(Boolean)
  const inDir = tracked.filter((p) => SCOPE.includeDirs.some((d) => p.startsWith(d)))
  const out: string[] = []
  for (const rel of inDir) {
    try {
      const { data } = matter(readFileSync(resolve(lifeRoot, rel), 'utf8'))
      if (SCOPE.excludeStatus.includes(String(data.status ?? '').toLowerCase())) continue
      if (data[SCOPE.optOutField] === false) continue
      out.push(rel)
    } catch { /* 読めないものはスキップ */ }
  }
  return out
}

/** scope 内の git 追跡 .html（自己完結 HTML 成果物）の相対パス一覧。frontmatter は無いので dir 一致のみ。 */
export function selectScopedArtifacts(lifeRoot: string): string[] {
  const tracked = execFileSync('git', ['-C', lifeRoot, 'ls-files', '*.html'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split('\n').filter(Boolean)
  return tracked.filter((p) => SCOPE.includeDirs.some((d) => p.startsWith(d)))
}
