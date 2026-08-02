import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Workers Static Assets 出力。target は site/wrangler.jsonc の main+assets で決まる（Pages ではなく Workers）。
		adapter: adapter({
			platformProxy: {
				remoteBindings: false
			}
		}),
		prerender: {
			// AASA はどこからもリンクされないので、クロールでは見つからない。
			// **prerender させたいのは、ビルド時に中身の検証を走らせるため**
			// （universal-links.ts が形を確かめて throw する）。Apple の CDN は最大 48 時間
			// キャッシュして手動で無効化できないので、壊れたものを配ると 2 日間直せない。
			entries: ['*', '/.well-known/apple-app-site-association']
		}
	}
};

export default config;
