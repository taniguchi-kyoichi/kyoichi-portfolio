// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	/** ビルド時刻（ISO8601・秒精度）。vite.config.ts の define が埋め込む。 */
	const __BUILD_TIME__: string;

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env?: {
				/** Cloudflare Workers AI binding (configured in wrangler.toml). */
				AI: import('@cloudflare/workers-types').Ai;
				/** KV for /api/chat rate limiting + global daily cap. */
				CHAT_LIMITS?: import('@cloudflare/workers-types').KVNamespace;
			};
		}
	}
}

export {};
