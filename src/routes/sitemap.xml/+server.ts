import { products } from '$lib/data/products';
import { ossProjects } from '$lib/data/oss';

const SITE_URL = 'https://taniguchi-kyoichi.com';

export async function GET() {
	const staticPages = [
		{ url: '', priority: '1.0', changefreq: 'weekly' },
		{ url: '/writings', priority: '0.8', changefreq: 'daily' },
		{ url: '/oss', priority: '0.8', changefreq: 'weekly' }
	];

	const productPages = products.map((p) => ({
		url: `/products/${p.id}`,
		priority: '0.6',
		changefreq: 'monthly'
	}));

	const ossPages = ossProjects.map((p) => ({
		url: `/oss/${p.id}`,
		priority: '0.6',
		changefreq: 'monthly'
	}));

	const allPages = [...staticPages, ...productPages, ...ossPages];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
	.map(
		(p) => `  <url>
    <loc>${SITE_URL}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
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
