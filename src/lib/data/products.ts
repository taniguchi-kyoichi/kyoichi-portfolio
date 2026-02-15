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
			effectiveDate: '2026-02-14',
			dataCollection: 'standard',
			dataItems: [
				'アカウント情報（Google/Apple Sign-In）',
				'読書記録・本棚データ（Firestore クラウド同期）',
				'チャットメモ・AI対話履歴（Firestore クラウド同期）',
				'プロフィール情報・アバター画像（Cloud Storage）',
				'読書目標・アチーブメント（Firestore クラウド同期）',
				'アプリ利用状況（Firebase Analytics）'
			],
			thirdPartyServices: [
				'Firebase Authentication（ユーザー認証）',
				'Cloud Firestore（データ保存・同期）',
				'Cloud Storage for Firebase（画像保存）',
				'Firebase Analytics（利用状況分析）',
				'Claude API by Anthropic（AI対話機能）',
				'Google Books API / OpenBD（書籍情報検索）',
				'RevenueCat（サブスクリプション管理）'
			],
			analyticsUsed: true,
			contactEmail: 'info@taniguchi-kyoichi.com'
		},
		support: {
			contactEmail: 'info@taniguchi-kyoichi.com',
			faq: [
				{
					question: 'データはどこに保存されますか？',
					answer: '読書記録やメモはFirebase（Google Cloud）上に安全に保存され、デバイス間で同期されます。アカウントにログインすれば、どのデバイスからでもデータにアクセスできます。'
				},
				{
					question: 'インターネット接続は必要ですか？',
					answer: 'はい、ログインやデータの同期にインターネット接続が必要です。オフライン時もキャッシュされたデータの閲覧は可能ですが、新規登録や編集にはオンライン環境が必要です。'
				},
				{
					question: 'アカウントやデータを削除するには？',
					answer: 'プロフィール画面の「アカウント削除」からアカウントと全データを完全に削除できます。この操作は取り消せません。'
				},
				{
					question: '無料プランとプレミアムプランの違いは？',
					answer: '無料プランでは月10冊まで登録可能です。プレミアムプラン（月額¥600 / 年額¥6,000）では登録冊数無制限で全機能をご利用いただけます。'
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
	},
	{
		id: 'mindmap-ai',
		name: 'マインドマップAI',
		description:
			'AIを活用した無限キャンバスのマインドマップアプリ。生成AIがアイデアを提案し、なぜなぜ分析で問題の根本原因を探ります。',
		fullDescription:
			'マインドマップAIは、創造的な思考と効率的なプランニングをサポートするアプリです。無限に広がるキャンバス上でマインドマップを作成でき、複数の生成AI（Claude、GPT-4、Gemini）がアイデアを提案します。なぜなぜ分析機能で問題の根本原因を深掘りでき、作成したマップは自動保存・外部ファイルへのエクスポートも可能です。',
		type: 'app',
		status: 'production',
		platforms: ['ios', 'macos'],
		links: {
			appStore: 'https://apps.apple.com/jp/app/id6470609816'
		},
		technologies: ['Swift', 'SwiftUI', 'AI', 'Firebase'],
		thumbnail: '/mindmap-ai-icon.jpg',
		featured: true,
		price: '無料（広告あり / アプリ内課金あり）',
		category: '仕事効率化',
		ageRating: '4+',
		features: [
			'無限キャンバスのマインドマップ作成',
			'複数AIによるアイデア自動生成（Claude、GPT-4、Gemini）',
			'なぜなぜ分析（根本原因分析）',
			'自動保存・.mmaiファイルエクスポート',
			'Google / Apple サインイン',
			'クラウド同期（Firestore）',
			'マルチプラットフォーム（iOS / macOS / visionOS）'
		],
		privacy: {
			effectiveDate: '2026-02-14',
			dataCollection: 'standard',
			dataItems: [
				'アカウント情報（Google/Apple Sign-In）',
				'マインドマップデータ（Firestore クラウド同期）',
				'AI生成履歴（サーバー経由、ログは保持しません）',
				'広告表示のための識別子（AdMob）',
				'アプリ利用状況（Firebase Analytics）'
			],
			thirdPartyServices: [
				'Firebase Authentication（ユーザー認証）',
				'Cloud Firestore（データ保存・同期）',
				'Firebase Analytics（利用状況分析）',
				'Google AdMob（広告配信）',
				'Anthropic Claude API（AI生成 - サーバー経由）',
				'OpenAI GPT-4 API（AI生成 - サーバー経由）',
				'Google Gemini API（AI生成 - サーバー経由）'
			],
			analyticsUsed: true,
			contactEmail: 'info@taniguchi-kyoichi.com'
		},
		support: {
			contactEmail: 'info@taniguchi-kyoichi.com',
			faq: [
				{
					question: 'データはどこに保存されますか？',
					answer: 'マインドマップはFirebase（Google Cloud）上に安全に保存され、デバイス間で同期されます。また、.mmaiファイルとして端末にエクスポートすることも可能です。'
				},
				{
					question: 'インターネット接続は必要ですか？',
					answer: 'AI生成機能とクラウド同期にはインターネット接続が必要です。ローカルに保存済みのマップの閲覧・編集はオフラインでも可能です。'
				},
				{
					question: 'AI生成機能はどのように動作しますか？',
					answer: 'AI生成はサーバー側で処理されます。お客様のマインドマップの内容がAIに送信されますが、サーバーにログとして保存されることはありません。'
				},
				{
					question: 'データを削除するには？',
					answer: 'アカウント設定からアカウントと全データを完全に削除できます。この操作は取り消せません。'
				}
			],
			systemRequirements: 'iOS 18.0以上 / macOS 15.0以上'
		}
	},
	{
		id: 'digital-detox',
		name: 'デジタルデトックス',
		description:
			'スマホをやめた後、何をすればいいかをAIが提案するデジタルウェルネスアプリ。呼吸介入で無意識の習慣ループに気づきを促し、AI代替活動レコメンドで行動変容を支援します。',
		fullDescription:
			'デジタルデトックスは、行動科学に基づいたデジタルウェルネスアプリです。SNS起動前に呼吸アニメーションを表示し、無意識の習慣ループに気づきを促します。「やめる」を選択すると、時間帯・興味・過去の評価に基づいてAIが代替活動を3択で提案。節約時間やキャンセル率をダッシュボードで可視化し、継続のモチベーションを維持します。',
		type: 'app',
		status: 'development',
		platforms: ['ios'],
		links: {},
		technologies: ['Swift', 'SwiftUI', 'AI', 'Firebase', 'HealthKit'],
		thumbnail: '/digital-detox-icon.jpg',
		featured: true,
		price: '無料（アプリ内課金あり）',
		category: 'ヘルスケア/フィットネス',
		ageRating: '4+',
		features: [
			'呼吸介入（5秒アニメーション + やめる/開く選択）',
			'AI代替活動レコメンド（時間帯・興味に応じた3択提案）',
			'節約時間・キャンセル率のダッシュボード表示',
			'使用パターン通知（キリ番での気づき促進）',
			'HealthKit連携（歩数データ活用）',
			'Shortcuts連携（自動介入トリガー）'
		],
		privacy: {
			effectiveDate: '2026-02-15',
			dataCollection: 'standard',
			dataItems: [
				'アカウント情報（Apple Sign-In）',
				'介入セッション記録（Firestore クラウド同期）',
				'興味カテゴリ・設定情報（Firestore クラウド同期）',
				'ヘルスケアデータ（HealthKit経由の歩数データ ※端末内処理のみ）',
				'アプリ利用状況（Firebase Analytics）'
			],
			thirdPartyServices: [
				'Firebase Authentication（ユーザー認証）',
				'Cloud Firestore（データ保存・同期）',
				'Firebase Analytics（利用状況分析）',
				'Claude API by Anthropic（AI代替活動レコメンド - サーバー経由）',
				'RevenueCat（サブスクリプション管理）',
				'Apple HealthKit（歩数データ取得 ※外部送信なし）'
			],
			analyticsUsed: true,
			contactEmail: 'info@taniguchi-kyoichi.com'
		},
		support: {
			contactEmail: 'info@taniguchi-kyoichi.com',
			faq: [
				{
					question: 'どうやってSNSアプリの起動を検知するのですか？',
					answer:
						'iOSのショートカットアプリと連携して動作します。オンボーディングで設定ガイドを案内しますので、指定のオートメーションを作成してください。'
				},
				{
					question: 'データはどこに保存されますか？',
					answer:
						'介入セッションの記録や設定はFirebase（Google Cloud）上に安全に保存され、デバイス間で同期されます。HealthKitのデータは端末内でのみ処理され、外部サーバーには送信されません。'
				},
				{
					question: 'インターネット接続は必要ですか？',
					answer:
						'呼吸介入はオフラインでも動作します。AIレコメンドにはインターネット接続が必要ですが、オフライン時はローカルの定型レコメンドが表示されます。'
				},
				{
					question: '無料プランとプレミアムプランの違いは？',
					answer:
						'無料プランではAIレコメンドが1日3回まで、ダッシュボードは当日分のみ表示されます。プレミアムプランではAIレコメンド無制限、週次/月次トレンドの分析が利用可能です。'
				}
			],
			systemRequirements: 'iOS 17.0以上'
		}
	}
];

export const featuredProducts = products.filter((p) => p.featured);
