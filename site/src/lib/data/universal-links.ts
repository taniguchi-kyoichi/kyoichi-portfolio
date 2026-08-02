/**
 * Universal Link を張るアプリの一覧（AASA の中身の正典）。
 *
 * このサイトのホスト（apex）1 つで複数アプリを受けられる。**アプリごとにパスの接頭辞を
 * 分ける**ので衝突しない。製品ページと同じ `/products/{slug}/` の下に置けば、
 * 名前空間は自然に割れる。
 *
 * 足すときは配列に append する。**既存の要素は書き換えない** ——
 * AASA の details は配列順に評価され、最初に一致した時点で止まる。
 *
 * 変更は `universal-links.test.ts` が検証する。Apple の CDN が最大 48 時間キャッシュし、
 * 手動で無効化できないので、壊れたものを配ると最長 2 日間直せない。
 */
export interface UniversalLinkApp {
	/** 人が読むための名前（AASA には出ない） */
	name: string;
	/** `{TEAM_ID}.{BUNDLE_ID}` */
	appID: string;
	/** このアプリが受け取るパス。`/products/{slug}/` の下に閉じる */
	paths: string[];
}

export const UNIVERSAL_LINK_APPS: UniversalLinkApp[] = [
	{
		name: 'ストックレーダー',
		appID: 'Y8MG29W5VM.com.taniguchi-kyoichi.stockradar',
		// 世帯への招待。コードは 24 時間で失効するので、この URL は使い捨て。
		paths: ['/products/stock-radar/join/*']
	}
];

/**
 * 読み込み時に形を確かめる。**AASA のルートは prerender なので、ここで throw すると
 * ビルドが落ちる** —— 壊れたものが配信に出ない。
 *
 * 目視で通さないのは、Apple の CDN を壊すと最長 48 時間直せないため。
 */
function assertWellFormed(apps: UniversalLinkApp[]): void {
	if (apps.length === 0) {
		throw new Error('AASA: details が空。1 つも無いなら AASA 自体を配らない');
	}
	const seen = new Set<string>();
	for (const app of apps) {
		if (!/^[A-Z0-9]{10}\.[A-Za-z0-9.-]+$/.test(app.appID)) {
			throw new Error(`AASA: appID の形が違う（{TEAM_ID}.{BUNDLE_ID}）: ${app.appID}`);
		}
		if (seen.has(app.appID)) {
			throw new Error(`AASA: appID が重複している: ${app.appID}`);
		}
		seen.add(app.appID);
		if (app.paths.length === 0) {
			throw new Error(`AASA: paths が空: ${app.appID}`);
		}
		for (const path of app.paths) {
			if (!path.startsWith('/')) {
				throw new Error(`AASA: paths は / で始める: ${path}`);
			}
			// apex は個人サイト本体でもある。`/*` や `/` を渡すと、サイトの全ページが
			// アプリに奪われる。アプリごとに自分の名前空間へ閉じる。
			if (!path.startsWith('/products/')) {
				throw new Error(`AASA: paths は /products/{slug}/ の下に閉じる: ${path}`);
			}
		}
	}
}

assertWellFormed(UNIVERSAL_LINK_APPS);
