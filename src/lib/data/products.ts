import type { Product } from '$lib/types';

export const products: Product[] = [
	{
		id: 'reading-memory',
		name: '読書メモリー',
		description:
			'本との出会いと対話を美しく記録するアプリ。AIチャットメモ・読書習慣トラッキング・本棚管理機能を搭載。',
		type: 'app',
		status: 'production',
		platforms: ['ios'],
		links: {
			appStore: 'https://apps.apple.com/jp/app/id6751159926'
		},
		technologies: ['Swift', 'SwiftUI', 'AI'],
		featured: true
	}
];

export const featuredProducts = products.filter((p) => p.featured);
