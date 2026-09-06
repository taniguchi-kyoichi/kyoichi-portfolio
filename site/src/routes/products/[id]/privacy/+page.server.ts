import type { PageServerLoad } from './$types';
import { products } from '$lib/data/products';
import { error } from '@sveltejs/kit';
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_SIZE, SITE_NAME, SITE_URL } from '$lib/seo';
import type { SEO } from '$lib/seo';

export const load: PageServerLoad = async ({ params }) => {
	const product = products.find((p) => p.id === params.id);

	if (!product || !product.privacy) {
		throw error(404, 'Privacy policy not found');
	}

	const seo: SEO = {
		title: `プライバシーポリシー - ${product.name} | ${SITE_NAME}`,
		description: `${product.name} のプライバシーポリシー`,
		canonical: `${SITE_URL}/products/${product.id}/privacy`,
		ogType: 'website',
		ogImage: DEFAULT_OG_IMAGE,
		ogImageAlt: SITE_NAME,
		ogImageWidth: DEFAULT_OG_IMAGE_SIZE,
		ogImageHeight: DEFAULT_OG_IMAGE_SIZE,
		twitterCard: 'summary',
		// アプリ審査のために URL を生かしているだけの法務ページ。検索には出さない。
		noindex: true
	};

	return { product, seo };
};
