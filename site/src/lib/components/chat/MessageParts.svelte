<script lang="ts">
	import type { ChatMessage } from '$lib/chat';
	import ChatProductCard from './ChatProductCard.svelte';
	import ChatOSSCard from './ChatOSSCard.svelte';
	import ArticleCard from '$lib/components/ArticleCard.svelte';
	import ProfileCard from './ProfileCard.svelte';
	import ContactCard from './ContactCard.svelte';
	import VideoCard from './VideoCard.svelte';
	import Markdown from './Markdown.svelte';
	import ToolSkeleton from './ToolSkeleton.svelte';

	interface Props {
		message: ChatMessage;
	}

	let { message }: Props = $props();

	// In-progress states show a skeleton. A failed tool gets its own visible
	// branch below — swallowing `output-error` silently is what let a provider
	// bug break every card while the chat still looked like it was working.
	function loading(state: string): boolean {
		return state === 'input-streaming' || state === 'input-available';
	}
</script>

{#each message.parts as part, i (i)}
	{#if part.type === 'text'}
		{#if part.text.trim()}
			<Markdown text={part.text} />
		{/if}

		<!-- any tool that failed -> say so instead of rendering an empty answer -->
	{:else if 'state' in part && part.state === 'output-error'}
		<p class="text-sm text-gray-500 dark:text-gray-400">
			情報を読み込めませんでした。もう一度お試しください。
		</p>

		<!-- getProfile -> ProfileCard -->
	{:else if part.type === 'tool-getProfile'}
		{#if part.state === 'output-available'}
			<ProfileCard profile={part.output} />
		{:else if loading(part.state)}
			<ToolSkeleton label="プロフィールを読み込み中…" />
		{/if}

		<!-- listProducts -> grid of ProductCard -->
	{:else if part.type === 'tool-listProducts'}
		{#if part.state === 'output-available'}
			{#if part.output.length > 0}
				<div class="carousel flex snap-x gap-3 overflow-x-auto pb-1">
					{#each part.output as product (product.id)}
						<div class="w-72 shrink-0 snap-start [&>*]:h-full"><ChatProductCard {product} /></div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-gray-500 dark:text-gray-400">該当するプロダクトはありません。</p>
			{/if}
		{:else if loading(part.state)}
			<ToolSkeleton label="プロダクトを探しています…" />
		{/if}

		<!-- getProductDetail -> single ProductCard -->
	{:else if part.type === 'tool-getProductDetail'}
		{#if part.state === 'output-available'}
			{#if part.output}
				<div class="w-80 max-w-full"><ChatProductCard product={part.output} /></div>
			{:else}
				<p class="text-sm text-gray-500 dark:text-gray-400">そのプロダクトは見つかりませんでした。</p>
			{/if}
		{:else if loading(part.state)}
			<ToolSkeleton label="プロダクトの詳細を読み込み中…" />
		{/if}

		<!-- listOSS -> grid of OSSCard -->
	{:else if part.type === 'tool-listOSS'}
		{#if part.state === 'output-available'}
			<div class="carousel flex snap-x gap-3 overflow-x-auto pb-1">
				{#each part.output as project (project.id)}
					<div class="w-72 shrink-0 snap-start [&>*]:h-full"><ChatOSSCard {project} /></div>
				{/each}
			</div>
		{:else if loading(part.state)}
			<ToolSkeleton label="OSS を探しています…" />
		{/if}

		<!-- getContact -> ContactCard -->
	{:else if part.type === 'tool-getContact'}
		{#if part.state === 'output-available'}
			<ContactCard contact={part.output} />
		{:else if loading(part.state)}
			<ToolSkeleton label="連絡先を読み込み中…" />
		{/if}

		<!-- listWritings / listReinArticles -> grid of ArticleCard -->
	{:else if part.type === 'tool-listWritings' || part.type === 'tool-listReinArticles'}
		{#if part.state === 'output-available'}
			{#if part.output.length > 0}
				<div class="carousel flex snap-x gap-3 overflow-x-auto pb-1">
					{#each part.output as article (article.url)}
						<div class="w-64 shrink-0 snap-start [&>*]:h-full"><ArticleCard {article} /></div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-gray-500 dark:text-gray-400">記事を取得できませんでした。</p>
			{/if}
		{:else if loading(part.state)}
			<ToolSkeleton label="記事を取得中…" />
		{/if}

		<!-- listVideos -> grid of VideoCard -->
	{:else if part.type === 'tool-listVideos'}
		{#if part.state === 'output-available'}
			{#if part.output.length > 0}
				<div class="carousel flex snap-x gap-3 overflow-x-auto pb-1">
					{#each part.output as video (video.videoId)}
						<div class="w-64 shrink-0 snap-start [&>*]:h-full"><VideoCard {video} /></div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-gray-500 dark:text-gray-400">動画を取得できませんでした。</p>
			{/if}
		{:else if loading(part.state)}
			<ToolSkeleton label="動画を取得中…" />
		{/if}
	{/if}
{/each}
