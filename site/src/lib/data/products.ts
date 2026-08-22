import type { Product } from '$lib/types';

export const products: Product[] = [
	{
		id: 'reading-memory',
		name: '読書メモリー',
		description:
			'本との出会いを美しく記録する、読書好きのためのシンプルな読書管理アプリ。ビジュアル本棚で蔵書を眺め、チャット形式で気軽にメモを残し、自分の読書の歩みを振り返れます。',
		fullDescription:
			'読書メモリーは、本を愛するすべての人のための読書管理アプリです。読みたい本・読書中の本・読み終えた本を、美しいビジュアル本棚で眺めるように管理できます。\n\n気になった一節や考えたことは、チャット形式の読書メモで気軽に残せます。一冊との対話の記録が積み重なっていくことで、本との関係が深まり、後から読み返したときに当時の自分の感覚も一緒に蘇ります。\n\nバーコードスキャンで蔵書登録は数秒。ジャンルやステータス、評価別の読書統計で、自分がどんな読書をしてきたかを振り返れます。読書好きの世界観を大切に、装飾より本そのものが映えるデザインを目指しました。',
		type: 'app',
		status: 'production',
		platforms: ['ios'],
		links: {
			appStore: 'https://apps.apple.com/jp/app/id6751159926'
		},
		technologies: ['Swift', 'SwiftUI'],
		thumbnail: '/reading-memory-icon.webp',
		ogImage: '/reading-memory-icon.jpg',
		featured: true,
		rating: 5.0,
		ratingCount: 3,
		price: '無料',
		category: 'ブック',
		ageRating: '4+',
		features: [
			'美しいビジュアル本棚（グリッド・リスト表示）',
			'チャット形式の気軽な読書メモ',
			'読書ステータス管理（読みたい・読書中・読了・中断）',
			'バーコードスキャンで蔵書登録',
			'ジャンル・ステータス・評価別の読書統計',
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
		id: 'gohobi-shukan',
		name: 'ごほうび習慣',
		description:
			'習慣を達成するたびに「ごほうびのお金」が貯まり、好きなごほうびと交換できる。ゲーム感覚で自己管理が続く、シンプルな習慣化アプリ。',
		fullDescription:
			'ごほうび習慣は、続けたい習慣に「ごほうび」をひもづけて、ゲームのように楽しく続けるためのアプリです。運動・勉強・早寝など、達成したい習慣を決めて金額を設定すると、こなすたびに仮想のお金が貯まっていきます。\n\n貯まったお金は、自分へのごほうび（好きなものややりたいこと）と交換できます。続けるほど貯まる継続ボーナス、時間で貯めるタイマー、毎日のリマインダーで、モチベーションを自然に保てます。\n\n3年間の休眠を経て、クラウドバックアップ・多端末同期・デザインを刷新して近代化しました。データはこの端末に自動でバックアップされ、Pro（買い切り）で Google / Apple 連携すると、機種変更や再インストールをまたいで全端末に同期できます。',
		type: 'app',
		status: 'production',
		platforms: ['ios'],
		links: {
			appStore: 'https://apps.apple.com/jp/app/id1671700938'
		},
		technologies: ['Flutter', 'Dart', 'Cloudflare Workers', 'D1', 'Firebase'],
		thumbnail: '/gohobi-shukan-icon.png',
		ogImage: '/gohobi-shukan-icon.png',
		featured: true,
		rating: 4.7,
		ratingCount: 73,
		price: '無料（買い切り Pro あり）',
		category: 'ライフスタイル',
		ageRating: '4+',
		features: [
			'習慣の達成でごほうびのお金が貯まる',
			'貯めたお金を、自分へのごほうびと交換',
			'続けるほど増える継続ボーナス',
			'時間で貯めるタイマーと、毎日のリマインダー',
			'この端末に自動バックアップ（無料）',
			'Pro（買い切り）で広告削除＋Google / Apple 連携の多端末同期'
		],
		privacy: {
			effectiveDate: '2026-07-19',
			dataCollection: 'standard',
			dataItems: [
				'アカウント情報（匿名サインイン。任意で Google / Apple 連携）',
				'習慣・ごほうび・達成／交換の記録（クラウドにバックアップ・同期）',
				'購入状態（RevenueCat）',
				'広告識別子（無料版の広告配信のみ）'
			],
			thirdPartyServices: [
				'Firebase Authentication（匿名 + Google / Apple サインイン）',
				'Cloudflare Workers / D1（データのバックアップ・同期）',
				'RevenueCat（アプリ内課金の管理）',
				'Google AdMob（広告配信・無料版のみ）'
			],
			analyticsUsed: false,
			contactEmail: 'info@taniguchi-kyoichi.com'
		},
		support: {
			contactEmail: 'info@taniguchi-kyoichi.com',
			faq: [
				{
					question: 'どうやってお金が貯まりますか？',
					answer:
						'続けたい習慣を登録して1回あたりの金額を決めると、その習慣を達成するたびに仮想のお金が貯まります。続けるほど増える継続ボーナスもあります。'
				},
				{
					question: '貯まったお金は現実のお金ですか？',
					answer:
						'いいえ。アプリ内だけの仮想のごほうびで、現金として引き出すことはできません。貯めたお金は、自分で決めた「ごほうび」と交換して、続けるモチベーションに使います。'
				},
				{
					question: 'データはどこに保存されますか？',
					answer:
						'この端末に自動でバックアップされ、うっかり削除しても元に戻せます。機種変更や別の端末との共有は、Pro（買い切り）で Google または Apple にサインインすると有効になります。'
				},
				{
					question: '機種変更してもデータを引き継げますか？',
					answer:
						'Pro を購入して設定画面から Google または Apple でサインインすると、データが全端末に同期され、機種変更や再インストールをまたいでも引き継げます。新しい端末では、同じ Apple ID で購入を復元してから同じアカウントでサインインしてください。'
				},
				{
					question: 'Pro（買い切り）で何ができますか？',
					answer:
						'買い切りの Pro で、①すべての広告を非表示 ②Google / Apple 連携による多端末同期・データの永続化 が使えるようになります。サブスクではなく、一度の購入でずっと使えます。'
				},
				{
					question: '購入を復元するには？',
					answer:
						'設定画面の「購入を復元」から復元できます。以前に Pro を購入した Apple ID でサインインした状態で実行してください。'
				},
				{
					question: 'リマインダーの通知が届きません',
					answer:
						'iOS の「設定」→「通知」→「ごほうび習慣」で通知が許可されているかご確認ください。習慣ごとの通知は、習慣の編集画面から曜日と時刻を設定できます。'
				}
			],
			systemRequirements: 'iOS 15.0以上'
		}
	},
	{
		id: 'rein',
		name: 'Rein',
		description:
			'意志じゃなくて、仕組み。ダイエット・運動・コミュニケーション・スマホ習慣のつまずきを認知科学で見直し、自分との付き合い方を変えていく iOS アプリ。',
		fullDescription:
			'Rein は、頑張りや意志の力で自分を変えるのではなく、自分の状態を観察して、付き合い方を少しずつ変えていくためのアプリです。\n\n暴飲暴食、運動が続かない、人にうまく連絡できない、気づいたらスマホを開いている — そういう日常のつまずきを「直すべき欠陥」ではなく「自分を知るサイン」として扱います。失敗したときも、責めるのではなく、次の一歩を選び直すための手がかりに変えます。\n\n強制せず、押し付けず、卒業も自由。使わなくなったらそれでよく、また戻ってきてもいいアプリを目指しています。',
		type: 'app',
		status: 'development',
		platforms: ['ios'],
		links: {},
		technologies: ['Swift', 'SwiftUI', 'Foundation Models', 'Firebase'],
		thumbnail: '/rein-icon.webp',
		ogImage: '/rein-icon.png',
		featured: true,
		hidden: true,
		price: '無料（プレミアム予定）',
		category: 'ヘルスケア/フィットネス',
		ageRating: '4+',
		features: [
			'ダイエット・運動・コミュニケーション・スマホ習慣の 4 つを 1 つのアプリで',
			'衝動や停滞を「サイン」として記録し、自分を観察できる',
			'失敗を責めずに、次の一歩を選び直すリフレクション',
			'押し付けない、そっと差し出すデザイン',
			'いつでも卒業できる、戻ってきてもいい設計'
		]
	},
	{
		id: 'now-my-task',
		name: 'now my task',
		description:
			'頭の中の「あれやらなきゃ」を、ぜんぶ手放せる。一行書くと「自分でやる／人やAIに頼んだ／自分で決める」に自動で分かれ、ちょうどいい時に思い出させる、AI時代の非同期タスク管理アプリ。',
		fullDescription:
			'now my task は、頭の中でタスクを覚えておく負担をゼロにするためのタスク管理アプリです。思いついたことを一行書くだけで、「自分でやる」「人やAIに頼んだ」「自分で決める」に自動で振り分け、ちょうどいい時間や場所が来たら、ひとつずつ「今やること」として戻してくれます。\n\nこれからは、自分でこなすだけでなく、AIや人に頼んで非同期に進めるのが当たり前。頼んだことの確認を忘れず、「帰ったら」「会社で」といった未来の自分宛の用事も頭から手放せます。そして、AIに結論を出させてはいけない大事な判断は、自分で考える時間として守ります。\n\n開発の過程を公開しながらつくっています（build in public）。',
		type: 'app',
		status: 'development',
		platforms: ['ios'],
		links: {
			web: 'https://nowmytask.com'
		},
		technologies: ['Swift', 'SwiftUI', 'Cloudflare Workers', 'Workers AI'],
		thumbnail: '/now-my-task-icon.png',
		ogImage: '/now-my-task-icon.png',
		buildInPublic: true,
		price: '無料（プレミアム予定）',
		category: '仕事効率化',
		ageRating: '4+',
		features: [
			'一行書くだけで「自分でやる／人やAIに頼んだ／自分で決める」に自動で整理',
			'人やAIに頼んだことを、ちょうどいい時刻に思い出させる',
			'「帰ったら」「会社で」など、未来の自分に渡して頭から消す',
			'大事な判断はAIに結論を出させず、自分で決める時間を残す',
			'通知から1タップで完了／再通知'
		]
	},
	{
		id: 'stock-radar',
		name: 'ストックレーダー',
		description:
			'家の消耗品の「切れかけ」を予知して、買い忘れと二重買いをなくす。数えない・開かない・忘れても壊れない、家族で使える在庫管理アプリ。',
		fullDescription:
			'ストックレーダーは、トイレットペーパーや洗剤といった家の消耗品を切らさないためのアプリです。在庫を数えて記録するのではなく、「買った」を1タップ押すだけ。購入の間隔から、そろそろ切れそうなタイミングをそっと予知して教えます。\n\n通知とウィジェットで「今どれが切れかけか」がすぐわかるので、アプリを開く必要すらありません。買ってきたレシートを撮れば、買ったものをまとめて記録できます。買い物前チェックで、買うもの・買わなくていいもの（最近買ったもの）を分けて見られるので、二重買いも防げます。\n\nソロ利用は全機能無料。パートナーと同じ在庫リストを共有したいときだけ「ふたりプラン」をどうぞ。氏名やメールアドレスは保存しません。アカウントの削除はアプリの中からいつでもでき、世帯のデータごと消えます。',
		type: 'app',
		status: 'production',
		platforms: ['ios'],
		// App Store のリンクは**公開を確かめてから**入れる（審査中に入れると 404 を晒す）。
		// 2026-08-21 に 1.0 が公開されたので入れた（iTunes Lookup で trackId を実測）。
		links: {
			appStore: 'https://apps.apple.com/jp/app/id6792582581',
			web: 'https://stock-radar.taniguchi-kyoichi.com'
		},
		technologies: ['Swift', 'SwiftUI', 'Cloudflare Workers', 'D1', 'Firebase'],
		thumbnail: '/stock-radar-icon.png',
		ogImage: '/stock-radar-icon.jpg',
		featured: true,
		releaseDate: '2026-08-21',
		version: '1.0',
		price: '無料（ふたりプランのみ有料）',
		category: 'ライフスタイル',
		ageRating: '4+',
		features: [
			'「買った」1タップで、切れかけを自動予知',
			'通知とウィジェットで、開かずに把握',
			'買い物前チェックで二重買いを防止',
			'ふたりプランでパートナーと在庫を共有',
			'氏名・メール不要。アカウント削除はアプリ内から'
		],
		privacy: {
			// 本文を実態に合わせて書き直した日。**中身を直したらここも直す** ——
			// 表示だけ古い日付が残ると、法務ページがそのページ自身の内容と食い違う。
			effectiveDate: '2026-08-02',
			dataCollection: 'minimal',
			dataItems: [
				'匿名アカウント識別子（Firebase 匿名 / Apple / Google Sign-In の uid）',
				'表示名（「あなた／パートナー」の表示に使うニックネーム。本名は保存しません）',
				'在庫アイテム・購入記録（Cloudflare D1 にクラウド同期）',
				'アイテム・世帯・プロフィールの画像（Cloudflare R2 に保存）',
				'レシートの写真（読み取りのため送信し、保存はしません）',
				'世帯共有の招待情報（招待コードはハッシュのみ保存）',
				'プッシュ通知トークン（切れかけ通知の配信）',
				'サブスクリプションの購入状態（RevenueCat）',
				'アプリ内の操作イベント（改善のための利用状況分析。広告には使いません）'
			],
			thirdPartyServices: [
				'Firebase Authentication（匿名・Apple・Google のユーザー認証）',
				'Firebase Analytics（利用状況の分析。広告 ID は取得しません）',
				'Cloudflare Workers / D1 / R2（データ・画像の保存、世帯同期）',
				'Google Gemini（バーコードとレシートの読み取り。画像は保存しません）',
				'Apple Push Notification service（通知配信）',
				'RevenueCat（サブスクリプション管理）'
			],
			analyticsUsed: true,
			contactEmail: 'info@taniguchi-kyoichi.com'
		},
		support: {
			contactEmail: 'info@taniguchi-kyoichi.com',
			faq: [
				{
					question: '無料でどこまで使えますか？',
					answer:
						'ソロ利用（アイテム登録・切れかけ予知・1タップ記録・通知・ウィジェット・買い物前チェック・レシート登録）は全機能無料です。パートナーと在庫リストを共有する「ふたりプラン」だけが有料です。'
				},
				{
					question: 'ふたりプランとは？',
					answer:
						'同じ家の在庫を、パートナーと1つのリストで共有できるプランです（月額¥800 / 年額¥6,000）。世帯内のどちらか1人が加入すれば、二人で共有できます。'
				},
				{
					question: 'データはどこに保存されますか？',
					answer:
						'在庫や購入記録は Cloudflare（D1）に安全に保存され、世帯内のデバイス間で同期されます。氏名やメールアドレスは保存しません（メンバーは「あなた／パートナー」の役割で扱います）。'
				},
				{
					question: 'アカウントやデータを削除するには？',
					answer:
						'アカウント画面の「アカウントを削除」から、世帯データを含めて完全に削除できます。この操作は取り消せません。'
				}
			],
			systemRequirements: 'iOS 26.0以上'
		}
	}
];

export const featuredProducts = products.filter((p) => p.featured && !p.hidden);
/** 通常の Products 一覧に出す（非表示・build in public を除く） */
export const visibleProducts = products.filter((p) => !p.hidden && !p.buildInPublic);
/** build in public 専用セクションに出す */
export const buildingInPublic = products.filter((p) => !p.hidden && p.buildInPublic);
