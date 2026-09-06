export type TwitterCard = 'summary' | 'summary_large_image';
export type OGType = 'website' | 'article' | 'profile';

export interface SEO {
	title: string;
	description: string;
	canonical: string;
	ogType?: OGType;
	ogImage?: string;
	ogImageAlt?: string;
	ogImageWidth?: number;
	ogImageHeight?: number;
	twitterCard?: TwitterCard;
	jsonLd?: unknown;
	/** Set for thin/JS-only routes (e.g. /ask) to keep them out of the index. */
	noindex?: boolean;
}

export const SITE_URL = 'https://taniguchi-kyoichi.com';
export const SITE_NAME = '谷口 恭一';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/profile.jpg`;
// profile.jpg is 460×460 — keep this in sync with the actual file.
export const DEFAULT_OG_IMAGE_SIZE = 460;

export function absoluteUrl(path: string): string {
	if (path.startsWith('http://') || path.startsWith('https://')) return path;
	return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** 半角=1 / 全角=2 で数えた表示幅。SERP の切り詰めはピクセル幅なのでこれで近似する。 */
function displayWidth(text: string): number {
	let width = 0;
	for (const char of text) width += /[\x00-\xFF\uFF61-\uFF9F]/.test(char) ? 1 : 2;
	return width;
}

/**
 * `name — tagline` を検索結果に収まる幅へ詰める（全角およそ 31 字）。
 * 切れて見えない位置の情報は読まれないので、収まる分だけを自分で選んで置く。
 * 区切り文字まで戻すのは、そうしても大きく削れないときだけ（語の途中で切るより、
 * 情報を落とす方が損なことがある）。
 */
export function fitTitle(name: string, tagline: string, budget = 62): string {
	const separator = ' — ';
	const room = budget - displayWidth(name) - displayWidth(separator);
	if (!tagline || room <= 0) return name;
	if (displayWidth(tagline) <= room) return `${name}${separator}${tagline}`;

	let cut = '';
	for (const char of tagline) {
		if (displayWidth(cut + char) > room - 2) break; // 末尾の「…」の分
		cut += char;
	}
	const boundary = Math.max(cut.lastIndexOf('、'), cut.lastIndexOf('・'), cut.lastIndexOf(' '));
	if (boundary >= Math.floor(cut.length * 0.6)) cut = cut.slice(0, boundary);
	return `${name}${separator}${cut.trimEnd()}…`;
}
