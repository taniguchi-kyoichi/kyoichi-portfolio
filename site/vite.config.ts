import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	define: {
		// sitemap の <lastmod> に使う。ページはすべてリポジトリ内のデータから生成されるので、
		// 内容が変わるのはビルドの時だけ。リクエスト時刻を入れると毎回「今更新した」と
		// 言うことになり、クローラは lastmod を信用しなくなる。
		__BUILD_TIME__: JSON.stringify(new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'))
	},
	plugins: [tailwindcss(), sveltekit()]
});
