import type { OSSProject } from '$lib/types';

export const ossProjects: OSSProject[] = [
	// Tools
	{
		id: 'claude-code-plugins',
		name: 'claude-code-plugins',
		description: 'Claude Code プラグイン集 - iOS/Go開発、Firebase Emulator、リリース自動化、通知ツール',
		repository: 'https://github.com/no-problem-dev/claude-code-plugins',
		language: 'Shell',
		topics: ['claude-code', 'plugins', 'automation'],
		featured: true
	},

	// Featured (Star 2+, Fork 1+)
	{
		id: 'swift-design-system',
		name: 'swift-design-system',
		description: 'SwiftUI向けの型安全で拡張可能なデザインシステム',
		repository: 'https://github.com/no-problem-dev/swift-design-system',
		language: 'Swift',
		topics: ['swiftui', 'design-system', 'ios'],
		featured: true
	},
	{
		id: 'swift-ui-routing',
		name: 'swift-ui-routing',
		description: 'SwiftUI向けの型安全で宣言的なルーティングライブラリ',
		repository: 'https://github.com/no-problem-dev/swift-ui-routing',
		language: 'Swift',
		topics: ['swiftui', 'routing', 'navigation'],
		featured: true
	},
	{
		id: 'swift-statable',
		name: 'swift-statable',
		description: 'Swift Macro for Observable State Management with AsyncValue pattern',
		repository: 'https://github.com/no-problem-dev/swift-statable',
		language: 'Swift',
		topics: ['swift-macro', 'state-management', 'async'],
		featured: true
	},

	// LLM/AI
	{
		id: 'swift-llm-structured-outputs',
		name: 'swift-llm-structured-outputs',
		description: 'Type-safe structured output generation for Swift LLM clients',
		repository: 'https://github.com/no-problem-dev/swift-llm-structured-outputs',
		language: 'Swift',
		topics: ['llm', 'ai', 'structured-output'],
		featured: false
	},
	{
		id: 'llm-codable',
		name: 'LLMCodable',
		description: 'Codableのような直感的なプロトコルでLLMベースの構造化データ変換を実現',
		repository: 'https://github.com/no-problem-dev/LLMCodable',
		language: 'Swift',
		topics: ['llm', 'codable', 'ai'],
		featured: false
	},

	// UI Components
	{
		id: 'swift-markdown-view',
		name: 'swift-markdown-view',
		description: 'SwiftUI-native Markdown rendering library with DesignSystem integration and syntax highlighting',
		repository: 'https://github.com/no-problem-dev/swift-markdown-view',
		language: 'Swift',
		topics: ['swiftui', 'markdown', 'syntax-highlighting'],
		featured: false
	},
	{
		id: 'swift-cached-remote-image',
		name: 'swift-cached-remote-image',
		description: 'SwiftUI向けリモート画像キャッシュ - メモリ&ディスクの二層キャッシュで高速表示',
		repository: 'https://github.com/no-problem-dev/swift-cached-remote-image',
		language: 'Swift',
		topics: ['swiftui', 'image-cache', 'async'],
		featured: false
	},

	// API/Networking
	{
		id: 'swift-api-client',
		name: 'swift-api-client',
		description: 'async/await対応の軽量HTTPクライアント - 型安全なAPI通信をSwiftで実現',
		repository: 'https://github.com/no-problem-dev/swift-api-client',
		language: 'Swift',
		topics: ['http-client', 'async-await', 'networking'],
		featured: false
	},
	{
		id: 'swift-api-contract',
		name: 'swift-api-contract',
		description: 'Type-safe API contract definitions with Swift macros',
		repository: 'https://github.com/no-problem-dev/swift-api-contract',
		language: 'Swift',
		topics: ['swift-macro', 'api', 'type-safe'],
		featured: false
	},
	{
		id: 'swift-api-server',
		name: 'swift-api-server',
		description: 'Swift製の軽量APIサーバーフレームワーク',
		repository: 'https://github.com/no-problem-dev/swift-api-server',
		language: 'Swift',
		topics: ['server', 'api', 'backend'],
		featured: false
	},
	{
		id: 'swift-firebase-server',
		name: 'swift-firebase-server',
		description: 'Firestore REST API client for server-side Swift',
		repository: 'https://github.com/no-problem-dev/swift-firebase-server',
		language: 'Swift',
		topics: ['firebase', 'firestore', 'server'],
		featured: false
	},

	// Authentication & Subscription
	{
		id: 'swift-authentication',
		name: 'swift-authentication',
		description: 'Firebase認証統合パッケージ - Google/Apple Sign-Inをasync/awaitで簡単実装',
		repository: 'https://github.com/no-problem-dev/swift-authentication',
		language: 'Swift',
		topics: ['firebase', 'authentication', 'sign-in'],
		featured: false
	},
	{
		id: 'swift-subscription',
		name: 'swift-subscription',
		description: 'RevenueCat統合のサブスクリプション管理 - SwiftUIとasync/awaitでシンプルに',
		repository: 'https://github.com/no-problem-dev/swift-subscription',
		language: 'Swift',
		topics: ['revenuecat', 'subscription', 'in-app-purchase'],
		featured: false
	},

	// Utilities
	{
		id: 'swift-env',
		name: 'swift-env',
		description: 'Swift macros for declarative environment variable configuration access',
		repository: 'https://github.com/no-problem-dev/swift-env',
		language: 'Swift',
		topics: ['swift-macro', 'environment', 'configuration'],
		featured: false
	},
	{
		id: 'swift-physical-units',
		name: 'swift-physical-units',
		description: 'Type-safe physical units library for Swift with compile-time dimension checking',
		repository: 'https://github.com/no-problem-dev/swift-physical-units',
		language: 'Swift',
		topics: ['units', 'type-safe', 'physics'],
		featured: false
	},

	// Template
	{
		id: 'swift-app-template',
		name: 'swift-app-template',
		description: 'iOS + Swift Backend fullstack template with Clean Architecture, Firebase Auth, and Firestore',
		repository: 'https://github.com/no-problem-dev/swift-app-template',
		language: 'Swift',
		topics: ['template', 'clean-architecture', 'fullstack'],
		featured: false
	}
];

export const featuredOSS = ossProjects.filter((p) => p.featured);
