import type { Handle, RequestEvent } from '@sveltejs/kit';

// Security headers on every server-rendered response (documents + /api).
// `script-src 'unsafe-inline'` is kept because the theme bootstrap script and
// JSON-LD blocks are inline; everything else is locked down (no external JS,
// no framing, no plugins). The chat only connects same-origin (/api/chat).
const CSP = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"font-src 'self' https://fonts.gstatic.com",
	"img-src 'self' https: data:",
	"connect-src 'self'",
	"frame-ancestors 'none'",
	"base-uri 'self'",
	"object-src 'none'"
].join('; ');

// www も custom domain として 200 を返しており、canonical タグ頼みで正規化されていた。
// http→https はゾーンの Always Use HTTPS がエッジで畳むので、ここでは扱わない。
const CANONICAL_HOST = 'taniguchi-kyoichi.com';

/**
 * www を apex へ寄せる。不要なら null。
 *
 * URL オブジェクトのホスト分解は使わない。workerd では `url.hostname` にポートが
 * 入り（`127.0.0.1:8788`）、`url.host` への代入も効かないことがある。Host ヘッダを
 * 既知の 1 値と直接比べれば、ローカルを巻き込む余地もループする余地も無い。
 */
function canonicalRedirect(event: RequestEvent): string | null {
	const host = event.request.headers.get('host')?.toLowerCase();
	if (host !== `www.${CANONICAL_HOST}`) return null;
	return `https://${CANONICAL_HOST}${event.url.pathname}${event.url.search}`;
}

export const handle: Handle = async ({ event, resolve }) => {
	// 308（301 ではなく）にするのは、メソッドを保つため。/api/* が www に来ても壊れない。
	const redirect = canonicalRedirect(event);
	if (redirect) return new Response(null, { status: 308, headers: { location: redirect } });

	const response = await resolve(event);
	response.headers.set('Content-Security-Policy', CSP);
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
	response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
	return response;
};
