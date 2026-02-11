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
		],
		privacy: {
			effectiveDate: '2026-02-11',
			dataCollection: 'minimal',
			dataItems: ['読書記録データ（端末内保存）', 'AI対話履歴（端末内保存）'],
			thirdPartyServices: ['OpenAI API（AI対話機能）'],
			analyticsUsed: false,
			contactEmail: 'info@taniguchi-kyoichi.com'
		},
		support: {
			contactEmail: 'info@taniguchi-kyoichi.com',
			faq: [
				{
					question: 'データはクラウドに保存されますか？',
					answer: '読書記録やメモはすべて端末内に保存されます。外部サーバーへのデータ送信は行いません。'
				},
				{
					question: 'AI機能にはインターネット接続が必要ですか？',
					answer: 'AI対話機能を使用する場合のみインターネット接続が必要です。それ以外の機能はオフラインで利用できます。'
				},
				{
					question: 'アプリを削除するとデータは消えますか？',
					answer: 'はい、アプリを削除するとすべてのデータが端末から削除されます。'
				}
			],
			systemRequirements: 'iOS 17.0以上'
		}
	},
	{
		id: 'markdown-preview',
		name: 'MDCanvas',
		description:
			'Markdownファイルをリアルタイムでプレビューできるビューアアプリ。iCloudやFilesアプリと連携し、どこからでもMarkdownを美しく表示します。',
		fullDescription:
			'MDCanvasは、Markdownファイルを美しくレンダリングするiOS向けビューアアプリです。iCloud DriveやFilesアプリからMarkdownファイルを開き、リアルタイムでプレビューできます。Share Extensionにも対応しており、他のアプリからMarkdownファイルを直接開くことも可能です。',
		type: 'app',
		status: 'development',
		platforms: ['ios'],
		links: {},
		technologies: ['Swift', 'SwiftUI', 'WebKit'],
		thumbnail: '/mdcanvas-icon.jpg',
		featured: true,
		price: '無料',
		category: '仕事効率化',
		ageRating: '4+',
		features: [
			'Markdownリアルタイムプレビュー',
			'iCloud Drive / Files連携',
			'Share Extension対応',
			'シンタックスハイライト',
			'ダークモード対応'
		],
		privacy: {
			effectiveDate: '2026-02-11',
			dataCollection: 'none',
			contactEmail: 'info@taniguchi-kyoichi.com'
		},
		support: {
			contactEmail: 'info@taniguchi-kyoichi.com',
			faq: [
				{
					question: 'どのファイル形式に対応していますか？',
					answer: '.md および .markdown ファイルに対応しています。'
				},
				{
					question: 'iCloud以外のクラウドストレージは使えますか？',
					answer: 'Filesアプリに対応しているクラウドストレージ（Dropbox、Google Drive等）からファイルを開くことができます。'
				}
			],
			systemRequirements: 'iOS 17.0以上'
		}
	}
];

export const featuredProducts = products.filter((p) => p.featured);
