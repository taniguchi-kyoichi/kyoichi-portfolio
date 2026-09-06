import { Marked } from 'marked';

/**
 * GitHub の README を、このサイトで表示できる HTML にする。
 *
 * README の相対リンクはリポジトリ基準で書かれている。素通しすると
 * `[LICENSE](LICENSE)` が `/oss/LICENSE` に解決され、存在しない URL への
 * 内部リンクになる（2026-09 に 35 ページ全部で発生していた）。
 */

export interface Readme {
	markdown: string;
	owner: string;
	repo: string;
	/** README が実在したブランチ。相対リンクはこのブランチ基準で解決する。 */
	branch: string;
}

const BRANCHES = ['main', 'master'] as const;

function parseRepo(repository: string): { owner: string; repo: string } | null {
	const m = repository.match(/github\.com\/([^/]+)\/([^/?#]+)/);
	if (!m) return null;
	return { owner: m[1], repo: m[2].replace(/\.git$/, '') };
}

export async function fetchReadme(
	repository: string,
	fetchFn: typeof fetch
): Promise<Readme | null> {
	const parsed = parseRepo(repository);
	if (!parsed) return null;

	try {
		for (const branch of BRANCHES) {
			const res = await fetchFn(
				`https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${branch}/README.md`
			);
			if (res.ok) return { markdown: await res.text(), branch, ...parsed };
		}
	} catch {
		return null;
	}
	return null;
}

/** 既にどこかを指しているか、ページ内に留まる URL。触らない。 */
function alreadyResolved(url: string): boolean {
	return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url.trim());
}

/**
 * README 基準の相対パスを、GitHub 自身の README ビューアと同じ解決をする。
 * `href` はリポジトリの blob、画像はレンダリングされる raw を指す。
 */
function resolveReadmeUrl(url: string, readme: Readme, kind: 'blob' | 'raw'): string {
	if (!url || alreadyResolved(url)) return url;
	const base =
		kind === 'raw'
			? `https://raw.githubusercontent.com/${readme.owner}/${readme.repo}/${readme.branch}/`
			: `https://github.com/${readme.owner}/${readme.repo}/blob/${readme.branch}/`;
	try {
		// README の中の先頭 `/` は「リポジトリのルート」であって github.com のルートではない。
		return new URL(url.replace(/^\/+/, ''), base).href;
	} catch {
		return url;
	}
}

/** README に直接書かれた生 HTML（`<img src="...">` など）の属性を書き換える。 */
function rewriteRawHtml(html: string, readme: Readme): string {
	return html.replace(
		/\b(href|src|srcset)\s*=\s*(["'])([^"']*)\2/gi,
		(_whole, attr: string, quote: string, value: string) => {
			const name = attr.toLowerCase();
			const next =
				name === 'srcset'
					? value
							.split(',')
							.map((candidate) => {
								const [url, ...descriptor] = candidate.trim().split(/\s+/);
								return [resolveReadmeUrl(url, readme, 'raw'), ...descriptor].join(' ');
							})
							.join(', ')
					: resolveReadmeUrl(value, readme, name === 'href' ? 'blob' : 'raw');
			return `${attr}=${quote}${next}${quote}`;
		}
	);
}

/**
 * 書き換えは構文木の上で行う。生成済み HTML を正規表現で舐めると、README が
 * 例として見せている `<a href="LICENSE">` まで書き換わる。code / codespan は
 * 別トークンなので、link / image / html だけ歩けば表示用コードは無傷で残る。
 */
export function renderReadme(readme: Readme): string {
	const marked = new Marked({ gfm: true, async: false });
	marked.use({
		walkTokens(token) {
			if (token.type === 'heading') {
				// README の `# パッケージ名` はページの <h1> と重複する。1 段下げる。
				token.depth = Math.min(token.depth + 1, 6);
			} else if (token.type === 'link') {
				token.href = resolveReadmeUrl(token.href, readme, 'blob');
			} else if (token.type === 'image') {
				token.href = resolveReadmeUrl(token.href, readme, 'raw');
			} else if (token.type === 'html') {
				token.text = rewriteRawHtml(token.text, readme);
			}
		}
	});
	return marked.parse(readme.markdown, { async: false }) as string;
}
