import { products } from '$lib/data/products';
import { ossProjects } from '$lib/data/oss';
import { SITE_URL } from '$lib/seo';

/**
 * `changefreq` と `priority` は書かない。**Google は両方とも無視する**（公式に明言）。
 * 代わりに実際に見られる `lastmod` を出す。ページはリポジトリ内のデータから生成されるので、
 * 内容が変わるのはビルドの時だけ。ビルド時刻を使うのは正確で、デプロイ間で安定する。
 *
 * 載せるのは「インデックスされてほしいページ」だけ。`/ask` は noindex なので入れない。
 */
function paths(): string[] {
	// /products/{id}/privacy と /support は載せない。アプリ審査のために URL が
	// 生きているだけの法務ページで、ページ自身が noindex を宣言している。
	// sitemap は「インデックスしてほしい」の宣言なので、載せると自分の指示と矛盾する。
	return [
		'',
		'/writings',
		'/rein',
		'/oss',
		...products.filter((p) => !p.hidden).map((p) => `/products/${p.id}`),
		...ossProjects.map((p) => `/oss/${p.id}`)
	];
}

export async function GET() {
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths()
	.map(
		(path) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${__BUILD_TIME__}</lastmod>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(xml.trim(), {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
}
