<script lang="ts">
	import ArticleCard from '$lib/components/ArticleCard.svelte';
	import { profile } from '$lib/data/profile';

	let { data } = $props();
</script>

<svelte:head>
	<title>Writings | {profile.name}</title>
	<meta name="description" content="{profile.name}が執筆した技術記事一覧" />
	<meta property="og:title" content="Writings | {profile.name}" />
	<meta property="og:description" content="{profile.name}が執筆した技術記事一覧。Zenn・noteで公開中の技術ブログ。" />
</svelte:head>

<section class="bg-white py-12 md:py-20 dark:bg-gray-900">
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
		<div class="mb-8 sm:mb-12">
			<a
				href="/"
				class="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
				ホームに戻る
			</a>
			<h1 class="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
				Writings
			</h1>
			<p class="text-sm text-gray-600 sm:text-base dark:text-gray-400">
				技術記事・ブログ
			</p>
		</div>

		{#if data.articles.length > 0}
			<div class="grid gap-4 sm:gap-6">
				{#each data.articles as article}
					<ArticleCard {article} />
				{/each}
			</div>
		{:else}
			<div class="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800">
				<p class="text-gray-600 dark:text-gray-400">記事がありません</p>
			</div>
		{/if}
	</div>
</section>
