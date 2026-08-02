import type { RequestHandler } from './$types';
import { UNIVERSAL_LINK_APPS } from '$lib/data/universal-links';

/**
 * Universal Link の検証ファイル。
 *
 * **静的ファイルではなくルートで返す。** 拡張子の無いファイルを静的配信すると
 * Content-Type が octet-stream になりうるが、ここでは自分で `application/json` を付けられる。
 * ディレクトリ名の `[x+2e]` は SvelteKit の記法で `.` を表す（`.well-known`）。
 *
 * **Apple の CDN は最大 48 時間キャッシュし、手動で無効化できない。**
 * 壊すと最長 2 日間直せないので、中身は `universal-links.ts` に置いてテストで検証する。
 * リダイレクトも不可（`www` は apex へ 301 なので、Universal Link のホストは apex だけ）。
 */
export const GET: RequestHandler = () =>
	new Response(
		JSON.stringify({
			applinks: {
				apps: [],
				// 評価は配列順で、最初に一致した時点で止まる。
				// **アプリを足すときは append する。既存の要素を書き換えない。**
				details: UNIVERSAL_LINK_APPS.map((app) => ({ appID: app.appID, paths: app.paths }))
			}
		}),
		{
			headers: {
				'content-type': 'application/json',
				// Apple の CDN 側が主だが、取得間隔を短めに申告しておく。
				'cache-control': 'public, max-age=3600'
			}
		}
	);

export const prerender = true;
