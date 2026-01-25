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

<article
	class="group relative flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-primary-300 hover:shadow-md sm:rounded-2xl sm:p-6 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-600"
>
	<div class="mb-3 flex items-start justify-between gap-2 sm:mb-4">
		<h3 class="text-base font-semibold text-gray-900 sm:text-lg dark:text-white">{product.name}</h3>
		<span
			class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium {statusColor[product.status]}"
		>
			{statusLabel[product.status]}
		</span>
	</div>

	<p class="mb-3 flex-grow text-sm text-gray-600 sm:mb-4 dark:text-gray-300">
		{product.description}
	</p>

	<div class="mb-3 flex flex-wrap gap-1 sm:mb-4 sm:gap-1.5">
		{#each product.platforms as platform}
			<span
				class="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700 sm:px-2 dark:bg-gray-700 dark:text-gray-300"
			>
				{platformLabel[platform] ?? platform}
			</span>
		{/each}
	</div>

	<div class="mb-3 flex flex-wrap gap-1 sm:mb-4 sm:gap-1.5">
		{#each product.technologies.slice(0, 4) as tech}
			<span
				class="rounded-md bg-primary-50 px-1.5 py-0.5 text-xs font-medium text-primary-700 sm:px-2 dark:bg-primary-900/30 dark:text-primary-400"
			>
				{tech}
			</span>
		{/each}
		{#if product.technologies.length > 4}
			<span
				class="rounded-md bg-gray-50 px-1.5 py-0.5 text-xs text-gray-500 sm:px-2 dark:bg-gray-700 dark:text-gray-400"
			>
				+{product.technologies.length - 4}
			</span>
		{/if}
	</div>

	<div class="flex flex-wrap gap-2">
		{#if product.links.appStore}
			<a
				href={product.links.appStore}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex min-h-[36px] items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700 sm:min-h-[32px] dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
			>
				App Store
			</a>
		{/if}
		{#if product.links.googlePlay}
			<a
				href={product.links.googlePlay}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex min-h-[36px] items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700 sm:min-h-[32px] dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
			>
				Google Play
			</a>
		{/if}
		{#if product.links.web}
			<a
				href={product.links.web}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:min-h-[32px] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
			>
				Web
			</a>
		{/if}
		{#if product.links.github}
			<a
				href={product.links.github}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:min-h-[32px] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
			>
				GitHub
			</a>
		{/if}
	</div>
</article>
