<script lang="ts">
	import type { Product } from '$lib/types';

	interface Props {
		data: {
			product: Product;
			code: string;
		};
	}

	let { data }: Props = $props();
	const product = data.product;
	const code = data.code;

	// App Store の数値 ID。Smart App Banner はこれを要る（URL ではなく ID）。
	const APP_STORE_ID = '6792582581';
	const appStoreURL = `https://apps.apple.com/jp/app/id${APP_STORE_ID}`;

	let copied = $state(false);

	async function copyCode() {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// クリップボードが使えない環境（古い内蔵ブラウザ等）。
			// コードは画面に出ているので、読んで打てば済む。
			copied = false;
		}
	}
</script>

<svelte:head>
	<!-- 使い捨ての URL。検索結果に出す意味が無い -->
	<meta name="robots" content="noindex, nofollow" />
	<!--
		Safari の上部に「アプリで開く」を出す。Universal Link が効かなかった経路
		（LINE の内蔵ブラウザ等）から Safari に移った人を拾う。
		app-argument に招待 URL を渡すと、アプリ側がそのままコードを取り出せる。
	-->
	<meta
		name="apple-itunes-app"
		content="app-id={APP_STORE_ID}, app-argument=https://taniguchi-kyoichi.com/products/{product.id}/join/{code}"
	/>
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
	<div class="w-full max-w-md">
		<div class="rounded-2xl bg-white p-6 shadow-sm sm:p-8 dark:bg-gray-800">
			<p class="text-sm text-gray-600 dark:text-gray-400">{product.name}</p>
			<h1 class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">世帯への招待</h1>
			<p class="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
				同じ家の在庫を、ふたりで 1 つのリストにするための招待です。
				アプリで下のコードを入力すると共有が始まります。
			</p>

			<!-- 主役。**リンクが効かなかった人が、これを読んで手で打つ**ための面 -->
			<div class="mt-6 rounded-xl bg-gray-50 p-5 text-center dark:bg-gray-900">
				<p class="text-xs text-gray-500 dark:text-gray-500">招待コード</p>
				<p
					class="mt-2 font-mono text-2xl font-bold tracking-[0.15em] break-all text-gray-900 select-all dark:text-white"
				>
					{code}
				</p>
				<button
					type="button"
					onclick={copyCode}
					class="mt-3 text-sm text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
				>
					{copied ? 'コピーしました' : 'コードをコピー'}
				</button>
			</div>

			<a
				href={appStoreURL}
				class="mt-6 block rounded-xl bg-primary-600 px-4 py-3 text-center font-medium text-white transition-colors hover:bg-primary-700"
			>
				App Store で入手する
			</a>

			<p class="mt-4 text-xs leading-relaxed text-gray-500 dark:text-gray-500">
				アプリを入れたら「うち」タブの「招待コードで参加」にこのコードを入力してください。
				招待コードは発行から 24 時間で失効します。切れていたら、送った相手にもう一度発行してもらってください。
			</p>

			<a
				href="/products/{product.id}"
				class="mt-6 block text-center text-sm text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
			>
				{product.name}について
			</a>
		</div>
	</div>
</main>
