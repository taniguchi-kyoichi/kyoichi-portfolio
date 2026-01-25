import type { Product } from '$lib/types';

export const products: Product[] = [
	{
		id: 'example-app',
		name: 'Example App',
		description: 'サンプルのiOSアプリケーション。ここに実際のプロダクト情報を追加してください。',
		type: 'app',
		status: 'production',
		platforms: ['ios'],
		links: {
			appStore: 'https://apps.apple.com/app/example'
		},
		technologies: ['Swift', 'SwiftUI', 'CloudKit'],
		releaseDate: '2024-01',
		featured: true
	}
];

export const featuredProducts = products.filter((p) => p.featured);
