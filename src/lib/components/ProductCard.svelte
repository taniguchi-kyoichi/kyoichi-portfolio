<script lang="ts">
	import type { Product } from '$lib/types';

	interface Props {
		product: Product;
	}

	let { product }: Props = $props();

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

<a
	href="/products/{product.id}"
	class="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-primary-300 hover:shadow-lg sm:rounded-2xl dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-600"
>
	<!-- App Icon and Header -->
	<div class="flex items-start gap-4 p-4 sm:p-6">
		{#if product.thumbnail}
			<img
				src={product.thumbnail}
				alt={product.name}
				class="h-20 w-20 shrink-0 rounded-2xl shadow-md transition-transform group-hover:scale-105 sm:h-24 sm:w-24"
			/>
		{/if}
		<div class="min-w-0 flex-1">
			<div class="mb-1 flex items-center gap-2">
				<h3 class="truncate text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
					{product.name}
				</h3>
				<span
					class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium {statusColor[product.status]}"
				>
					{statusLabel[product.status]}
				</span>
			</div>
			<div class="mb-2 flex flex-wrap items-center gap-2">
				{#each product.platforms as platform}
					<span class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
						{#if platform === 'ios'}
							<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
								<path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
							</svg>
						{/if}
						{platformLabel[platform] ?? platform}
					</span>
				{/each}
				{#if product.rating !== undefined}
					<span class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
						<svg class="h-3.5 w-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
							<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
						</svg>
						{product.rating}
					</span>
				{/if}
			</div>
			<p class="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
				{product.description}
			</p>
		</div>
	</div>

	<!-- Technologies -->
	<div class="border-t border-gray-100 px-4 py-3 sm:px-6 dark:border-gray-700">
		<div class="flex flex-wrap gap-1.5">
			{#each product.technologies.slice(0, 5) as tech}
				<span
					class="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
				>
					{tech}
				</span>
			{/each}
			{#if product.technologies.length > 5}
				<span
					class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400"
				>
					+{product.technologies.length - 5}
				</span>
			{/if}
		</div>
	</div>

	<!-- Download Button -->
	{#if product.links.appStore || product.links.googlePlay || product.links.web}
		<div class="border-t border-gray-100 p-4 sm:px-6 dark:border-gray-700">
			<div class="flex flex-wrap gap-2">
				{#if product.links.appStore}
					<button
						type="button"
						onclick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(product.links.appStore, '_blank'); }}
						class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-700 hover:shadow-md dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
					>
						<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
							/>
						</svg>
						App Storeで入手
					</button>
				{/if}
				{#if product.links.googlePlay}
					<button
						type="button"
						onclick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(product.links.googlePlay, '_blank'); }}
						class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-700 hover:shadow-md dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
					>
						<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"
							/>
						</svg>
						Google Play
					</button>
				{/if}
				{#if product.links.web}
					<button
						type="button"
						onclick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(product.links.web, '_blank'); }}
						class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
					>
						Webで開く
					</button>
				{/if}
			</div>
		</div>
	{/if}
</a>
