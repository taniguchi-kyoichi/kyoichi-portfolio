import type { PageServerLoad } from './$types';
import { products } from '$lib/data/products';
import { error } from '@sveltejs/kit';
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_SIZE, SITE_NAME, SITE_URL } from '$lib/seo';
import type { SEO } from '$lib/seo';

/**
 * 世帯への招待の着地ページ。
 *
 * **アプリが入っている端末はここに来ない** —— iOS が AASA を見て、この URL を
 * アプリで開く。到達するのは (a) アプリを持っていない相手 (b) LINE 等の内蔵ブラウザで
 * Universal Link が握られた場合。つまりここは**未導入の人が最初に見る面**で、
 * 招待の入口として一番効く場所になる。
 *
 * やることは 2 つだけ。**コードを大きく見せて手入力へ逃がすこと**と、
 * **アプリの入手先を示すこと**。リンク 1 本に依存しない（コードは手で打てる）。
 *
 * サーバーは招待コードを検証しない。有効かどうかはアプリが API に聞く。
 * ここで存在確認をすると、コードの総当たりに応える口になる。
 */
export const load: PageServerLoad = async ({ params }) => {
	const product = products.find((p) => p.id === params.id);

	// 招待を持つのは世帯共有のあるアプリだけ。ほかの製品の URL では出さない。
	if (!product || product.id !== 'stock-radar') {
		throw error(404, 'Not found');
	}

	// 表示するだけで、正規化も検証もしない（アプリ側が大小・区切りを吸収する）。
	const code = params.code;

	const seo: SEO = {
		title: `世帯への招待 - ${product.name} | ${SITE_NAME}`,
		description: `${product.name} で同じ家の在庫を共有するための招待です。`,
		canonical: `${SITE_URL}/products/${product.id}/join/${code}`,
		ogType: 'website',
		ogImage: DEFAULT_OG_IMAGE,
		ogImageAlt: product.name,
		ogImageWidth: DEFAULT_OG_IMAGE_SIZE,
		ogImageHeight: DEFAULT_OG_IMAGE_SIZE,
		twitterCard: 'summary',
		// 使い捨ての URL なので検索結果に出す意味が無い。
		noindex: true
	};

	return { product, code, seo };
};
