<script lang="ts">
	import type { Article } from '$lib/types';
	import { formatDate } from '$lib/utils/rss';

	interface Props {
		article: Article;
	}

	let { article }: Props = $props();

	const sourceLabel: Record<string, string> = {
		zenn: 'Zenn',
		note: 'note',
		other: 'Other'
	};

	const sourceColor: Record<string, string> = {
		zenn: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
		note: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
		other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
	};
</script>

<a
	href={article.url}
	target="_blank"
	rel="noopener noreferrer"
	class="group flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-primary-300 hover:shadow-md sm:rounded-2xl sm:p-6 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-600"
>
	<div class="mb-2 flex items-center gap-2 sm:mb-3">
		<span
			class="rounded-md px-2 py-0.5 text-xs font-medium {sourceColor[article.source]}"
		>
			{sourceLabel[article.source]}
		</span>
		<span class="text-xs text-gray-500 dark:text-gray-400">
			{formatDate(article.publishedAt)}
		</span>
	</div>

	<h3 class="mb-2 text-base font-semibold text-gray-900 group-hover:text-primary-600 sm:text-lg dark:text-white dark:group-hover:text-primary-400">
		{article.title}
	</h3>

	{#if article.description}
		<p class="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
			{article.description}
		</p>
	{/if}

	<div class="mt-3 flex items-center gap-1 text-sm text-primary-600 sm:mt-4 dark:text-primary-400">
		<span>記事を読む</span>
		<svg class="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
		</svg>
	</div>
</a>
