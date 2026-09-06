import type { PageServerLoad } from './$types';
import { products } from '$lib/data/products';
import { error } from '@sveltejs/kit';
import { profile } from '$lib/data/profile';
import { absoluteUrl, DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_SIZE, SITE_NAME, SITE_URL } from '$lib/seo';
import type { SEO } from '$lib/seo';

// schema.org Offer.price must be numeric. Free → '0'; non-numeric (e.g.
// '無料（プレミアム予定）') → '0'; otherwise extract digits, else omit offers.
function priceToOffer(price?: string) {
	if (!price) return undefined;
	if (price.startsWith('無料')) return { '@type': 'Offer', price: '0', priceCurrency: 'JPY' };
	const digits = price.replace(/[^\d.]/g, '');
	if (!digits) return undefined;
	return { '@type': 'Offer', price: digits, priceCurrency: 'JPY' };
}

export const load: PageServerLoad = async ({ params }) => {
	const product = products.find((p) => p.id === params.id);

	if (!product) {
		throw error(404, 'Product not found');
	}

	// SNS カードは WebP 非対応クライアントを考慮し raster の ogImage を優先。なければ thumbnail にフォールバック
	const socialImage = product.ogImage ?? product.thumbnail;
	const ogImage = socialImage ? absoluteUrl(socialImage) : DEFAULT_OG_IMAGE;

	const seo: SEO = {
		title: `${product.name} | ${SITE_NAME}`,
		description: product.description,
		canonical: `${SITE_URL}/products/${product.id}`,
		ogType: 'website',
		ogImage,
		ogImageAlt: product.name,
		ogImageWidth: socialImage ? undefined : DEFAULT_OG_IMAGE_SIZE,
		ogImageHeight: socialImage ? undefined : DEFAULT_OG_IMAGE_SIZE,
		twitterCard: 'summary',
		jsonLd: [
			{
				'@context': 'https://schema.org',
				'@type': 'BreadcrumbList',
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
					{ '@type': 'ListItem', position: 2, name: product.name }
				]
			},
			{
				'@context': 'https://schema.org',
				'@type': product.type === 'app' ? 'SoftwareApplication' : 'WebSite',
				name: product.name,
				description: product.description,
				url: `${SITE_URL}/products/${product.id}`,
				image: ogImage,
				applicationCategory: product.category ?? 'MobileApplication',
				operatingSystem: product.platforms.includes('ios')
					? 'iOS'
					: product.platforms.includes('macos')
						? 'macOS'
						: undefined,
				offers: priceToOffer(product.price),
				...(product.rating !== undefined
					? {
							aggregateRating: {
								'@type': 'AggregateRating',
								ratingValue: product.rating,
								ratingCount: product.ratingCount ?? 1,
								bestRating: 5
							}
						}
					: {}),
				author: { '@type': 'Person', name: profile.name, url: SITE_URL }
			}
		]
	};

	return { product, seo };
};
