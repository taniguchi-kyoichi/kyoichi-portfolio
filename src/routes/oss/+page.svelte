<script lang="ts">
	import { ossProjects } from '$lib/data/oss';
	import { profile } from '$lib/data/profile';
	import OSSCard from '$lib/components/OSSCard.svelte';
</script>

<svelte:head>
	<title>Open Source | {profile.name}</title>
	<meta name="description" content="{profile.name}が公開しているOSSプロジェクト一覧" />
</svelte:head>

<section class="bg-white py-12 md:py-20 dark:bg-gray-900">
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
		<div class="mb-8 sm:mb-12">
			<a
				href="/"
				class="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
				Back
			</a>
			<h1 class="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
				Open Source Projects
			</h1>
			<p class="text-sm text-gray-600 sm:text-base dark:text-gray-400">
				公開しているOSSプロジェクト（{ossProjects.length}件）
			</p>
		</div>

		<div class="grid gap-4 sm:gap-6 md:grid-cols-2">
			{#each ossProjects as project}
				<OSSCard {project} />
			{/each}
		</div>
	</div>
</section>
