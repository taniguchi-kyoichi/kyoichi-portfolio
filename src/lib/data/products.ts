import type { Product } from '$lib/types';

export const products: Product[] = [
	{
		id: 'reading-memory',
		name: '読書メモリー',
		description:
			'本との出会いと対話を美しく記録する読書管理アプリ。チャット形式で読書メモを記録し、AIアシスタントと対話しながら本への理解を深められます。',
		fullDescription:
			'読書メモリーは、本棚管理・読書ノート機能を統合した、本を愛するすべての人のための読書管理アプリです。チャット形式で読書メモを記録でき、AIアシスタントと対話しながら本への理解を深めることができます。美しいビジュアル本棚で蔵書を管理し、読書統計で自分の読書傾向を把握できます。',
		type: 'app',
		status: 'production',
		platforms: ['ios'],
		links: {
			appStore: 'https://apps.apple.com/jp/app/id6751159926'
		},
		technologies: ['Swift', 'SwiftUI', 'AI'],
		thumbnail: '/reading-memory-icon.jpg',
		featured: true,
		rating: 5.0,
		ratingCount: 3,
		price: '無料',
		category: 'ブック',
		ageRating: '4+',
		features: [
			'チャット形式の読書メモ機能',
			'ビジュアル本棚管理（グリッド・リスト表示）',
			'読書ステータス管理（読みたい・読書中・読了・中断）',
			'バーコードスキャンで簡単書籍登録',
			'ジャンル・ステータス・評価別の読書統計',
			'AIアシスタントとの対話機能',
			'ダークモード対応'
		]
	}
];

export const featuredProducts = products.filter((p) => p.featured);
