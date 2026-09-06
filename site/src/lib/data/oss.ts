import type { OSSProject, OSSKind } from "$lib/types";

// no-problem-dev の公開 Swift パッケージ群。swift-oss-doctor（OSS Health Dashboard）が
// 追跡する .oss-doctor/latest.json の tracked かつ GitHub public なリポジトリと一致させている。
// 種別が増えたら kind を足すだけで、Swift パッケージ以外（Claude Code プラグイン / npm 等）も同じモデルで載る。

export const ossProjects: OSSProject[] = [
  // エージェント / プロトコル
  {
    id: "swift-a2a",
    name: "swift-a2a",
    description:
      "Google A2A（Agent-to-Agent）プロトコルの Swift クライアント実装。エージェント同士を相互運用させる",
    kind: "swift-package",
    category: "エージェント / プロトコル",
    repository: "https://github.com/no-problem-dev/swift-a2a",
    language: "Swift",
    topics: ["agent", "a2a", "protocol"],
    featured: true,
  },
  {
    id: "swift-a2ui",
    name: "swift-a2ui",
    description:
      "Google A2UI プロトコルの Swift 実装。LLM エージェントがクライアントに型安全なリッチ UI を描画する",
    kind: "swift-package",
    category: "エージェント / プロトコル",
    repository: "https://github.com/no-problem-dev/swift-a2ui",
    language: "Swift",
    topics: ["agent", "a2ui", "swiftui"],
    featured: false,
  },
  {
    id: "swift-acp",
    name: "swift-acp",
    description:
      "Agent Client Protocol（ACP）の Swift 実装。ホスト↔エージェント間の JSON-RPC 契約を 135 の $defs として厳密に型付け",
    kind: "swift-package",
    category: "エージェント / プロトコル",
    repository: "https://github.com/no-problem-dev/swift-acp",
    language: "Swift",
    topics: ["agent", "acp", "json-rpc"],
    featured: false,
  },
  {
    id: "swift-acp-a2a-bridge",
    name: "swift-acp-a2a-bridge",
    description:
      "swift-a2a エージェントを ACP エージェントとして公開するブリッジ。ACP 契約と A2A メッセージ交換を相互変換する",
    kind: "swift-package",
    category: "エージェント / プロトコル",
    repository: "https://github.com/no-problem-dev/swift-acp-a2a-bridge",
    language: "Swift",
    topics: ["agent", "acp", "a2a", "bridge"],
    featured: false,
  },
  {
    id: "swift-acp-presentation",
    name: "swift-acp-presentation",
    description:
      "ACP のホスト側プレゼンテーション層。session/update を UI 非依存の状態に畳み込み、文言を String Catalog に集約する",
    kind: "swift-package",
    category: "エージェント / プロトコル",
    repository: "https://github.com/no-problem-dev/swift-acp-presentation",
    language: "Swift",
    topics: ["agent", "acp", "presentation"],
    featured: false,
  },
  {
    id: "swift-agent-skills",
    name: "swift-agent-skills",
    description:
      "SKILL.md オープン標準（Apache-2.0）の Swift 実装。スキルの読み込み・探索・実行・ツール統合を担う",
    kind: "swift-package",
    category: "エージェント / プロトコル",
    repository: "https://github.com/no-problem-dev/swift-agent-skills",
    language: "Swift",
    topics: ["agent", "skills", "skill-md"],
    featured: false,
  },
  {
    id: "swift-agent-runtime",
    name: "swift-agent-runtime",
    description:
      "A2A 前提のオーケストレータ＋ワーカー実行環境。専門ワーカーへの委譲・並列実行・ACP ゲートウェイをパッケージルートとして提供する Swift ランタイム",
    kind: "swift-package",
    category: "エージェント / プロトコル",
    repository: "https://github.com/no-problem-dev/swift-agent-runtime",
    language: "Swift",
    topics: ["agent", "runtime", "a2a", "acp"],
    featured: false,
  },
  // LLM / AI
  {
    id: "swift-llm-client",
    name: "swift-llm-client",
    description:
      "プロバイダー非依存の LLM クライアント抽象化。実装を差し替え可能なコア層",
    kind: "swift-package",
    category: "LLM / AI",
    repository: "https://github.com/no-problem-dev/swift-llm-client",
    language: "Swift",
    topics: ["llm", "ai", "client"],
    featured: true,
  },
  {
    id: "swift-llm-cloud",
    name: "swift-llm-cloud",
    description:
      "Anthropic / OpenAI / Gemini を束ねるマルチプロバイダー LLM クラウドクライアント",
    kind: "swift-package",
    category: "LLM / AI",
    repository: "https://github.com/no-problem-dev/swift-llm-cloud",
    language: "Swift",
    topics: ["llm", "anthropic", "openai", "gemini"],
    featured: false,
  },
  {
    id: "swift-llm-local",
    name: "swift-llm-local",
    description:
      "iOS / macOS のデバイス上でローカル LLM 推論を動かす Swift パッケージ",
    kind: "swift-package",
    category: "LLM / AI",
    repository: "https://github.com/no-problem-dev/swift-llm-local",
    language: "Swift",
    topics: ["llm", "on-device", "inference"],
    featured: false,
  },
  {
    id: "swift-llm-mcp",
    name: "swift-llm-mcp",
    description:
      "swift-llm-client 向けの MCP + ツール解決層。MCP サーバーと組み込みツールキットのアダプタ",
    kind: "swift-package",
    category: "LLM / AI",
    repository: "https://github.com/no-problem-dev/swift-llm-mcp",
    language: "Swift",
    topics: ["llm", "mcp", "tools"],
    featured: false,
  },
  {
    id: "swift-structured-data",
    name: "swift-structured-data",
    description:
      "外部由来の JSON / YAML / XML を Swift の型システムへ安全に変換するレイヤー",
    kind: "swift-package",
    category: "LLM / AI",
    repository: "https://github.com/no-problem-dev/swift-structured-data",
    language: "Swift",
    topics: ["json", "yaml", "type-safe"],
    featured: false,
  },
  {
    id: "swift-research-agent",
    name: "swift-research-agent",
    description:
      "Web 検索・取得ツールと引用ゲートを備えたリサーチャー・エージェント",
    kind: "swift-package",
    category: "LLM / AI",
    repository: "https://github.com/no-problem-dev/swift-research-agent",
    language: "Swift",
    topics: ["agent", "research", "web-search"],
    featured: false,
  },
  {
    id: "swift-media-agent",
    name: "swift-media-agent",
    description:
      "画像・チャート・動画生成ツールとセッション単位のメディアストアを持つビジュアライザー・エージェント",
    kind: "swift-package",
    category: "LLM / AI",
    repository: "https://github.com/no-problem-dev/swift-media-agent",
    language: "Swift",
    topics: ["agent", "media", "generation"],
    featured: false,
  },
  // UI / SwiftUI
  {
    id: "swift-design-system",
    name: "swift-design-system",
    description: "SwiftUI 向けの型安全で拡張可能なデザインシステム",
    kind: "swift-package",
    category: "UI / SwiftUI",
    repository: "https://github.com/no-problem-dev/swift-design-system",
    language: "Swift",
    topics: ["swiftui", "design-system", "ios"],
    featured: true,
  },
  {
    id: "swift-ui-routing",
    name: "swift-ui-routing",
    description: "SwiftUI 向けの型安全で宣言的なルーティングライブラリ",
    kind: "swift-package",
    category: "UI / SwiftUI",
    repository: "https://github.com/no-problem-dev/swift-ui-routing",
    language: "Swift",
    topics: ["swiftui", "routing", "navigation"],
    featured: true,
  },
  {
    id: "swift-statable",
    name: "swift-statable",
    description:
      "AsyncValue パターンで Observable な状態管理を実現する Swift マクロ",
    kind: "swift-package",
    category: "UI / SwiftUI",
    repository: "https://github.com/no-problem-dev/swift-statable",
    language: "Swift",
    topics: ["swift-macro", "state-management", "async"],
    featured: true,
  },
  {
    id: "swift-markdown-view",
    name: "swift-markdown-view",
    description:
      "DesignSystem 統合とシンタックスハイライトを備えた SwiftUI ネイティブな Markdown レンダリング",
    kind: "swift-package",
    category: "UI / SwiftUI",
    repository: "https://github.com/no-problem-dev/swift-markdown-view",
    language: "Swift",
    topics: ["swiftui", "markdown", "syntax-highlighting"],
    featured: false,
  },
  {
    id: "swift-latex-view",
    name: "swift-latex-view",
    description:
      "SwiftUI ネイティブな LaTeX 数式レンダリング。LLM 出力にも堅牢",
    kind: "swift-package",
    category: "UI / SwiftUI",
    repository: "https://github.com/no-problem-dev/swift-latex-view",
    language: "Swift",
    topics: ["swiftui", "latex", "math"],
    featured: false,
  },
  {
    id: "swift-cached-remote-image",
    name: "swift-cached-remote-image",
    description:
      "メモリ & ディスクの二層キャッシュで高速表示する SwiftUI リモート画像",
    kind: "swift-package",
    category: "UI / SwiftUI",
    repository: "https://github.com/no-problem-dev/swift-cached-remote-image",
    language: "Swift",
    topics: ["swiftui", "image-cache", "async"],
    featured: false,
  },
  {
    id: "swift-google-slides-view",
    name: "swift-google-slides-view",
    description:
      "Google Slides API の JSON を SwiftUI で描画。A2A アーティファクトのストリーミングに対応",
    kind: "swift-package",
    category: "UI / SwiftUI",
    repository: "https://github.com/no-problem-dev/swift-google-slides-view",
    language: "Swift",
    topics: ["swiftui", "google-slides", "a2a"],
    featured: false,
  },
  {
    id: "swift-document-scanner",
    name: "swift-document-scanner",
    description:
      "矩形検出・OCR・カメラ撮影を備えた iOS 向けドキュメントスキャン基盤",
    kind: "swift-package",
    category: "UI / SwiftUI",
    repository: "https://github.com/no-problem-dev/swift-document-scanner",
    language: "Swift",
    topics: ["ios", "scanner", "ocr"],
    featured: false,
  },
  {
    id: "swift-voice-input",
    name: "swift-voice-input",
    description:
      "ストリーミング認識とフローティングプレビュー UI を備えたプロトコル指向の音声入力",
    kind: "swift-package",
    category: "UI / SwiftUI",
    repository: "https://github.com/no-problem-dev/swift-voice-input",
    language: "Swift",
    topics: ["voice", "speech", "swiftui"],
    featured: false,
  },
  // 通信 / サーバー
  {
    id: "swift-api-client",
    name: "swift-api-client",
    description:
      "async/await 対応の軽量 HTTP クライアント。型安全な API 通信を Swift で",
    kind: "swift-package",
    category: "通信 / サーバー",
    repository: "https://github.com/no-problem-dev/swift-api-client",
    language: "Swift",
    topics: ["http-client", "async-await", "networking"],
    featured: false,
  },
  {
    id: "swift-api-contract",
    name: "swift-api-contract",
    description: "Swift マクロで型安全な API 契約を定義する",
    kind: "swift-package",
    category: "通信 / サーバー",
    repository: "https://github.com/no-problem-dev/swift-api-contract",
    language: "Swift",
    topics: ["swift-macro", "api", "type-safe"],
    featured: false,
  },
  {
    id: "swift-api-server",
    name: "swift-api-server",
    description:
      "Vapor を抽象化し、アプリケーションコードをフレームワーク実装から独立させるサーバー層",
    kind: "swift-package",
    category: "通信 / サーバー",
    repository: "https://github.com/no-problem-dev/swift-api-server",
    language: "Swift",
    topics: ["server", "vapor", "backend"],
    featured: false,
  },
  {
    id: "swift-firebase-server",
    name: "swift-firebase-server",
    description: "サーバーサイド Swift 向けの Firestore REST API クライアント",
    kind: "swift-package",
    category: "通信 / サーバー",
    repository: "https://github.com/no-problem-dev/swift-firebase-server",
    language: "Swift",
    topics: ["firebase", "firestore", "server"],
    featured: false,
  },
  {
    id: "swift-http-transport",
    name: "swift-http-transport",
    description:
      "URLSession をプロトコル背後に隠し、リトライ / レート制限 / SSE を一元化する通信基盤",
    kind: "swift-package",
    category: "通信 / サーバー",
    repository: "https://github.com/no-problem-dev/swift-http-transport",
    language: "Swift",
    topics: ["http", "urlsession", "sse"],
    featured: false,
  },
  {
    id: "swift-persistence",
    name: "swift-persistence",
    description:
      "KeyValue / Secure / Document / Registry を束ねるプロトコル指向の永続化抽象レイヤー",
    kind: "swift-package",
    category: "通信 / サーバー",
    repository: "https://github.com/no-problem-dev/swift-persistence",
    language: "Swift",
    topics: ["persistence", "keyvalue", "storage"],
    featured: false,
  },
  // 認証 / 課金
  {
    id: "swift-authentication",
    name: "swift-authentication",
    description:
      "Google / Apple Sign-In を async/await で扱う Firebase 認証統合パッケージ",
    kind: "swift-package",
    category: "認証 / 課金",
    repository: "https://github.com/no-problem-dev/swift-authentication",
    language: "Swift",
    topics: ["firebase", "authentication", "sign-in"],
    featured: false,
  },
  {
    id: "swift-subscription",
    name: "swift-subscription",
    description:
      "RevenueCat 統合のサブスクリプション管理を SwiftUI でシンプルに",
    kind: "swift-package",
    category: "認証 / 課金",
    repository: "https://github.com/no-problem-dev/swift-subscription",
    language: "Swift",
    topics: ["revenuecat", "subscription", "in-app-purchase"],
    featured: false,
  },
  // テスト
  {
    id: "swift-visual-testing",
    name: "swift-visual-testing",
    description:
      "@SnapshotSuite / @Snapshot による SwiftUI 向け宣言的スナップショットテスト",
    kind: "swift-package",
    category: "テスト",
    repository: "https://github.com/no-problem-dev/swift-visual-testing",
    language: "Swift",
    topics: ["snapshot-testing", "swiftui", "macro"],
    featured: false,
  },
  // ユーティリティ
  {
    id: "swift-env",
    name: "swift-env",
    description: "環境変数アクセスを宣言的に扱う Swift マクロ",
    kind: "swift-package",
    category: "ユーティリティ",
    repository: "https://github.com/no-problem-dev/swift-env",
    language: "Swift",
    topics: ["swift-macro", "environment", "configuration"],
    featured: false,
  },
  {
    id: "swift-physical-units",
    name: "swift-physical-units",
    description: "コンパイル時に次元検査を行う型安全な物理単位ライブラリ",
    kind: "swift-package",
    category: "ユーティリティ",
    repository: "https://github.com/no-problem-dev/swift-physical-units",
    language: "Swift",
    topics: ["units", "type-safe", "physics"],
    featured: false,
  },
  {
    id: "swift-ios-recorder",
    name: "swift-ios-recorder",
    description:
      "iOS のオンデバイス・ランタイムレコーダー。画面・状態・ネットワーク・AI デバッグ情報をキャプチャし Mac/MCP/AI へストリームする",
    kind: "swift-package",
    category: "ユーティリティ",
    repository: "https://github.com/no-problem-dev/swift-ios-recorder",
    language: "Swift",
    topics: ["ios", "debugging", "mcp", "recorder"],
    featured: false,
  },
];

// 種別ごとの表示ラベル（カードのバッジに使う）
export const ossKindLabel: Record<OSSKind, string> = {
  "swift-package": "Swift Package",
  "claude-code-plugin": "Claude Code Plugin",
  "npm-package": "npm",
};

// カテゴリ表示順（この順でセクション分けする）
const ossCategoryOrder = [
  "エージェント / プロトコル",
  "LLM / AI",
  "UI / SwiftUI",
  "通信 / サーバー",
  "認証 / 課金",
  "テスト",
  "ユーティリティ",
];

// カテゴリ別にグルーピング（該当なしカテゴリは除外）
export const ossByCategory = ossCategoryOrder
  .map((category) => ({
    category,
    projects: ossProjects.filter((p) => p.category === category),
  }))
  .filter((group) => group.projects.length > 0);

export const featuredOSS = ossProjects.filter((p) => p.featured);
