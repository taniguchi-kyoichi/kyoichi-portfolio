<script lang="ts">
	import { marked } from 'marked';
	import { profile } from '$lib/data/profile';
	import SocialIcon from '$lib/components/SocialIcon.svelte';

	interface Props {
		data: {
			project: {
				id: string;
				name: string;
				description: string;
				repository: string;
				language: string;
				topics?: string[];
				homepage?: string;
			};
			readme: string | null;
		};
	}

	let { data }: Props = $props();

	const languageColor: Record<string, string> = {
		TypeScript: 'bg-blue-500',
		JavaScript: 'bg-yellow-400',
		Swift: 'bg-orange-500',
		Kotlin: 'bg-purple-500',
		Rust: 'bg-orange-600',
		Go: 'bg-cyan-500',
		Python: 'bg-green-500',
		Ruby: 'bg-red-500',
		Shell: 'bg-gray-500'
	};

	const renderedReadme = $derived(data.readme ? marked(data.readme) : null);
</script>

<svelte:head>
	<title>{data.project.name} | {profile.name}</title>
	<meta name="description" content={data.project.description} />
</svelte:head>

<article class="bg-white py-12 md:py-20 dark:bg-gray-900">
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
		<!-- Back link -->
		<a
			href="/oss"
			class="mb-6 inline-flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			Back to OSS
		</a>

		<!-- Header -->
		<header class="mb-8 sm:mb-12">
			<div class="mb-4 flex items-center gap-3">
				<SocialIcon platform="github" class="h-8 w-8 text-gray-700 dark:text-gray-300" />
				<h1 class="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
					{data.project.name}
				</h1>
			</div>

			<p class="mb-6 text-base text-gray-600 sm:text-lg dark:text-gray-300">
				{data.project.description}
			</p>

			<!-- Meta info -->
			<div class="mb-6 flex flex-wrap items-center gap-4">
				<div class="flex items-center gap-1.5">
					<span
						class="h-3 w-3 rounded-full {languageColor[data.project.language] ?? 'bg-gray-400'}"
					></span>
					<span class="text-sm text-gray-600 dark:text-gray-400">{data.project.language}</span>
				</div>
			</div>

			<!-- Topics -->
			{#if data.project.topics && data.project.topics.length > 0}
				<div class="mb-6 flex flex-wrap gap-2">
					{#each data.project.topics as topic}
						<span
							class="rounded-md bg-primary-50 px-2.5 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
						>
							{topic}
						</span>
					{/each}
				</div>
			{/if}

			<!-- Links -->
			<div class="flex flex-wrap gap-3">
				<a
					href={data.project.repository}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
				>
					<SocialIcon platform="github" class="h-5 w-5" />
					View on GitHub
				</a>
				{#if data.project.homepage}
					<a
						href={data.project.homepage}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
					>
						Website
					</a>
				{/if}
			</div>
		</header>

		<!-- README content -->
		{#if renderedReadme}
			<section
				class="prose prose-gray max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-primary-600 prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-900 dark:prose-a:text-primary-400 dark:prose-code:bg-gray-800"
			>
				{@html renderedReadme}
			</section>
		{:else}
			<div
				class="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800"
			>
				<p class="text-gray-600 dark:text-gray-400">
					READMEが見つかりませんでした。GitHubリポジトリで詳細をご確認ください。
				</p>
			</div>
		{/if}
	</div>
</article>
