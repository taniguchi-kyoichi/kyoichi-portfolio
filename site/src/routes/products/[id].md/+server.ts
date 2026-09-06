import type { RequestHandler } from './$types';
import { products } from '$lib/data/products';
import { error } from '@sveltejs/kit';
import { SITE_URL } from '$lib/seo';

const platformLabel: Record<string, string> = {
	ios: 'iOS',
	android: 'Android',
	web: 'Web',
	macos: 'macOS',
	windows: 'Windows',
	linux: 'Linux',
	cli: 'CLI'
};

const statusLabel: Record<string, string> = {
	production: '公開中',
	development: '開発中',
	archived: 'アーカイブ'
};

export const GET: RequestHandler = ({ params, setHeaders }) => {
	const product = products.find((p) => p.id === params.id);

	if (!product) {
		throw error(404, 'Product not found');
	}

	setHeaders({
		'content-type': 'text/markdown; charset=utf-8',
		'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
		// LLM クローラー向けの同内容の別表現。HTML ページと重複するので検索には出さない。
		'x-robots-tag': 'noindex'
	});

	const lines: string[] = [];
	lines.push(`# ${product.name}`);
	lines.push('');
	lines.push(`> ${product.description}`);
	lines.push('');

	lines.push('## Overview');
	lines.push('');
	lines.push(`- **Status**: ${statusLabel[product.status] ?? product.status}`);
	lines.push(`- **Platforms**: ${product.platforms.map((p) => platformLabel[p] ?? p).join(', ')}`);
	if (product.category) lines.push(`- **Category**: ${product.category}`);
	if (product.price) lines.push(`- **Price**: ${product.price}`);
	if (product.ageRating) lines.push(`- **Age Rating**: ${product.ageRating}`);
	if (product.rating !== undefined) {
		lines.push(
			`- **Rating**: ${product.rating} / 5${product.ratingCount ? ` (${product.ratingCount}件)` : ''}`
		);
	}
	if (product.technologies.length > 0) {
		lines.push(`- **Technologies**: ${product.technologies.join(', ')}`);
	}
	lines.push(`- **Page**: ${SITE_URL}/products/${product.id}`);
	lines.push('');

	if (product.links.appStore || product.links.googlePlay || product.links.web || product.links.github) {
		lines.push('## Links');
		lines.push('');
		if (product.links.appStore) lines.push(`- App Store: ${product.links.appStore}`);
		if (product.links.googlePlay) lines.push(`- Google Play: ${product.links.googlePlay}`);
		if (product.links.web) lines.push(`- Web: ${product.links.web}`);
		if (product.links.github) lines.push(`- GitHub: ${product.links.github}`);
		lines.push('');
	}

	if (product.fullDescription) {
		lines.push('## Description');
		lines.push('');
		lines.push(product.fullDescription);
		lines.push('');
	}

	if (product.features && product.features.length > 0) {
		lines.push('## Features');
		lines.push('');
		for (const f of product.features) lines.push(`- ${f}`);
		lines.push('');
	}

	if (product.support?.systemRequirements) {
		lines.push('## System Requirements');
		lines.push('');
		lines.push(product.support.systemRequirements);
		lines.push('');
	}

	return new Response(lines.join('\n'));
};
