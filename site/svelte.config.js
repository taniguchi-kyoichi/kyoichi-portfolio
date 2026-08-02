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
		})
	}
};

export default config;
