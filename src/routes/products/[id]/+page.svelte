<script lang="ts">
	import { profile } from '$lib/data/profile';
	import type { Product } from '$lib/types';

	interface Props {
		data: {
			product: Product;
		};
	}

	let { data }: Props = $props();

	const statusLabel = {
		production: '公開中',
		development: '開発中',
		archived: 'アーカイブ'
	};

	const statusColor = {
		production: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
		development: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
		archived: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
	};

	const platformLabel: Record<string, string> = {
		ios: 'iOS',
		android: 'Android',
		web: 'Web',
		macos: 'macOS',
		windows: 'Windows',
		linux: 'Linux',
		cli: 'CLI'
	};
</script>

<svelte:head>
	<title>{data.product.name} | {profile.name}</title>
	<meta name="description" content={data.product.description} />
</svelte:head>

<article class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<!-- Hero Section -->
	<div class="bg-white dark:bg-gray-800">
		<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
			<!-- Back link -->
			<a
				href="/#products"
				class="mb-6 inline-flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
				戻る
			</a>

			<!-- App Header -->
			<div class="flex flex-col gap-6 sm:flex-row sm:items-start">
				<!-- App Icon -->
				{#if data.product.thumbnail}
					<img
						src={data.product.thumbnail}
						alt={data.product.name}
						class="h-32 w-32 shrink-0 rounded-[28px] shadow-xl sm:h-40 sm:w-40"
					/>
				{/if}

				<!-- App Info -->
				<div class="flex-1">
					<div class="mb-2 flex flex-wrap items-center gap-2">
						<h1 class="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
							{data.product.name}
						</h1>
						<span
							class="rounded-full px-2.5 py-0.5 text-xs font-medium {statusColor[data.product.status]}"
						>
							{statusLabel[data.product.status]}
						</span>
					</div>

					<p class="mb-4 text-base text-gray-600 dark:text-gray-300">
						{data.product.description}
					</p>

					<!-- Meta info row -->
					<div class="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
						{#if data.product.category}
							<span>{data.product.category}</span>
						{/if}
						{#each data.product.platforms as platform}
							<span class="flex items-center gap-1">
								{#if platform === 'ios'}
									<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
										<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
									</svg>
								{/if}
								{platformLabel[platform] ?? platform}
							</span>
						{/each}
						{#if data.product.ageRating}
							<span class="rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium dark:bg-gray-700">
								{data.product.ageRating}
							</span>
						{/if}
					</div>

					<!-- Rating and Price -->
					<div class="mb-6 flex flex-wrap items-center gap-6">
						{#if data.product.rating !== undefined}
							<div class="flex items-center gap-2">
								<div class="flex items-center gap-0.5">
									{#each Array(5) as _, i}
										<svg
											class="h-5 w-5 {i < Math.floor(data.product.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
										</svg>
									{/each}
								</div>
								<span class="text-lg font-semibold text-gray-900 dark:text-white">{data.product.rating}</span>
								{#if data.product.ratingCount}
									<span class="text-sm text-gray-500 dark:text-gray-400">({data.product.ratingCount}件)</span>
								{/if}
							</div>
						{/if}
						{#if data.product.price}
							<span class="text-lg font-semibold text-gray-900 dark:text-white">{data.product.price}</span>
						{/if}
					</div>

					<!-- Download Buttons -->
					<div class="flex flex-wrap gap-3">
						{#if data.product.links.appStore}
							<a
								href={data.product.links.appStore}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-gray-700 hover:shadow-lg dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
							>
								<svg class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
									<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
								</svg>
								App Storeで入手
							</a>
						{/if}
						{#if data.product.links.googlePlay}
							<a
								href={data.product.links.googlePlay}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-gray-700 hover:shadow-lg dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
							>
								<svg class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
									<path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
								</svg>
								Google Playで入手
							</a>
						{/if}
						{#if data.product.links.web}
							<a
								href={data.product.links.web}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:shadow-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
							>
								Webで開く
							</a>
						{/if}
						{#if data.product.links.github}
							<a
								href={data.product.links.github}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:shadow-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
							>
								<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
								</svg>
								GitHub
							</a>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Content Section -->
	<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
		<!-- Features Section -->
		{#if data.product.features && data.product.features.length > 0}
			<section class="mb-10">
				<h2 class="mb-6 text-xl font-bold text-gray-900 dark:text-white">機能</h2>
				<div class="grid gap-4 sm:grid-cols-2">
					{#each data.product.features as feature}
						<div class="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
							<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
								<svg class="h-4 w-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
								</svg>
							</div>
							<span class="text-gray-700 dark:text-gray-300">{feature}</span>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Description Section -->
		{#if data.product.fullDescription}
			<section class="mb-10">
				<h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">詳細</h2>
				<div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
					<p class="whitespace-pre-line leading-relaxed text-gray-700 dark:text-gray-300">
						{data.product.fullDescription}
					</p>
				</div>
			</section>
		{/if}

		<!-- Technologies Section -->
		<section class="mb-10">
			<h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">使用技術</h2>
			<div class="flex flex-wrap gap-2">
				{#each data.product.technologies as tech}
					<span
						class="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-300"
					>
						{tech}
					</span>
				{/each}
			</div>
		</section>

		<!-- Information Section -->
		<section>
			<h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">情報</h2>
			<div class="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
				<dl class="divide-y divide-gray-100 dark:divide-gray-700">
					{#if data.product.category}
						<div class="flex justify-between px-6 py-4">
							<dt class="text-gray-500 dark:text-gray-400">カテゴリ</dt>
							<dd class="font-medium text-gray-900 dark:text-white">{data.product.category}</dd>
						</div>
					{/if}
					{#if data.product.ageRating}
						<div class="flex justify-between px-6 py-4">
							<dt class="text-gray-500 dark:text-gray-400">年齢</dt>
							<dd class="font-medium text-gray-900 dark:text-white">{data.product.ageRating}</dd>
						</div>
					{/if}
					{#if data.product.price}
						<div class="flex justify-between px-6 py-4">
							<dt class="text-gray-500 dark:text-gray-400">価格</dt>
							<dd class="font-medium text-gray-900 dark:text-white">{data.product.price}</dd>
						</div>
					{/if}
					<div class="flex justify-between px-6 py-4">
						<dt class="text-gray-500 dark:text-gray-400">対応プラットフォーム</dt>
						<dd class="font-medium text-gray-900 dark:text-white">
							{data.product.platforms.map(p => platformLabel[p] ?? p).join(', ')}
						</dd>
					</div>
				</dl>
			</div>
		</section>
	</div>
</article>
