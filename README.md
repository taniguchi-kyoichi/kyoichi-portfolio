# Kyoichi Portfolio

個人ポートフォリオサイト。プロフィール、公開プロダクト、OSSプロジェクトを一覧表示するシンプルなサイト。

## Tech Stack

- **Framework**: SvelteKit 2 + Svelte 5
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Runtime**: Bun
- **Hosting**: Cloudflare Pages

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (推奨) または Node.js 20.19+
- [mise](https://mise.jdx.dev/) (オプション、バージョン管理用)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/kyoichi-portfolio.git
cd kyoichi-portfolio

# Install dependencies
make install
# or
bun install
```

### Development

```bash
# Start development server
make dev
# or
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
# Build for production
make build
# or
bun run build

# Preview production build
make preview
```

### Type Checking

```bash
make check
# or
bun run check
```

## Project Structure

```
src/
├── lib/
│   ├── components/     # Svelte components
│   │   ├── OSSCard.svelte
│   │   ├── ProductCard.svelte
│   │   └── SocialIcon.svelte
│   ├── data/           # Content data (edit these files)
│   │   ├── oss.ts      # OSS projects
│   │   ├── products.ts # Released products
│   │   └── profile.ts  # Profile & contact info
│   └── types/          # TypeScript type definitions
│       └── index.ts
├── routes/
│   ├── +layout.svelte  # Root layout
│   └── +page.svelte    # Home page
├── app.css             # Global styles & Tailwind config
└── app.html            # HTML template
```

## Content Management

コンテンツはTypeScriptファイルで管理されており、データベースは不要。

### プロフィール編集

`src/lib/data/profile.ts`:

```typescript
export const profile: Profile = {
  name: '名前',
  nameEn: 'Name in English',
  title: 'Software Engineer',
  bio: '自己紹介文...',
  socialLinks: [
    { platform: 'github', url: 'https://github.com/...', label: 'GitHub' },
    { platform: 'zenn', url: 'https://zenn.dev/...', label: 'Zenn' },
  ]
};
```

### プロダクト追加

`src/lib/data/products.ts`:

```typescript
export const products: Product[] = [
  {
    id: 'my-app',
    name: 'My App',
    description: 'アプリの説明',
    type: 'app',
    status: 'production',
    platforms: ['ios', 'android'],
    links: {
      appStore: 'https://apps.apple.com/...',
      googlePlay: 'https://play.google.com/...',
    },
    technologies: ['Swift', 'Kotlin'],
  }
];
```

### OSSプロジェクト追加

`src/lib/data/oss.ts`:

```typescript
export const ossProjects: OSSProject[] = [
  {
    id: 'my-library',
    name: 'my-library',
    description: 'ライブラリの説明',
    repository: 'https://github.com/...',
    language: 'TypeScript',
    topics: ['typescript', 'utility'],
  }
];
```

## Deployment

### Cloudflare Pages

```bash
# Deploy to Cloudflare Pages
make deploy
```

初回デプロイ時はCloudflareアカウントへのログインが必要:

```bash
bunx wrangler login
```

### GitHub Actions (Optional)

`.github/workflows/deploy.yml`を作成してCI/CDを設定可能。

## Available Commands

| Command | Description |
|---------|-------------|
| `make install` | Install dependencies |
| `make dev` | Start development server |
| `make build` | Build for production |
| `make check` | Run type checking |
| `make preview` | Preview production build |
| `make deploy` | Deploy to Cloudflare Pages |
| `make clean` | Remove build artifacts |

## License

MIT
