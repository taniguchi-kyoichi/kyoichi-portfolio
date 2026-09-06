<script lang="ts">
	import '../app.css';
	import { profile } from '$lib/data/profile';
	import { page } from '$app/state';
	import { SITE_NAME, SITE_URL } from '$lib/seo';
	import type { SEO } from '$lib/seo';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import MobileMenu from '$lib/components/MobileMenu.svelte';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import { openPalette } from '$lib/stores/commandPalette.svelte';
	import { isDebug } from '$lib/debug';
	import { onMount } from 'svelte';

	interface Props {
		children: import('svelte').Snippet;
		data: { url: string; seo: SEO };
	}

	let { children }: Props = $props();

	let mobileMenuOpen = $state(false);

	// dev-only: `?debug` freezes animations and shows a DEBUG badge for layout work
	onMount(() => {
		if (isDebug()) document.documentElement.classList.add('debug');
	});

	// Fallback so error pages (which may not provide `seo`) don't crash <svelte:head>.
	const seo = $derived(
		(page.data.seo as SEO | undefined) ?? {
			title: SITE_NAME,
			description: '',
			canonical: SITE_URL
		}
	);

	// エラー応答は「そのURLの中身」ではないので、インデックスさせず canonical も出さない。
	// +layout.server.ts は常に seo を返すため、404 でも自分自身を canonical に指す
	// index 可能なページとして出ていた（Search Console が 404 と判定したので実害は
	// 出ていないが、ソフト404 と読まれる余地を残す）。
	const isError = $derived(page.status >= 400);
	// robots はここが唯一の出力点。app.html にも固定値を置くと noindex 指定時に
	// 2 つ出て矛盾する。
	const noindex = $derived(isError || seo.noindex === true);

	const websiteJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: SITE_NAME,
		url: SITE_URL,
		author: {
			'@type': 'Person',
			name: profile.name,
			jobTitle: profile.title,
			url: SITE_URL,
			sameAs: profile.socialLinks.map((l) => l.url)
		}
	};

	// Escape `<` so a value can't break out of the JSON-LD script element via a
	// closing tag or comment sequence. Defensive — current data is author-controlled.
	function ldJson(obj: unknown): string {
		return JSON.stringify(obj).replace(/</g, '\\u003c');
	}
</script>

<svelte:head>
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	{#if noindex}
		<meta name="robots" content="noindex, follow" />
	{:else}
		<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
	{/if}
	{#if !isError}<link rel="canonical" href={seo.canonical} />{/if}

	<!-- Open Graph -->
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content="ja_JP" />
	<meta property="og:type" content={seo.ogType ?? 'website'} />
	<meta property="og:url" content={seo.canonical} />
	<meta property="og:title" content={seo.title} />
	<meta property="og:description" content={seo.description} />
	{#if seo.ogImage}
		<meta property="og:image" content={seo.ogImage} />
		{#if seo.ogImageAlt}<meta property="og:image:alt" content={seo.ogImageAlt} />{/if}
		{#if seo.ogImageWidth}<meta property="og:image:width" content={String(seo.ogImageWidth)} />{/if}
		{#if seo.ogImageHeight}<meta property="og:image:height" content={String(seo.ogImageHeight)} />{/if}
	{/if}

	<!-- Twitter Card -->
	<meta name="twitter:card" content={seo.twitterCard ?? 'summary'} />
	<meta name="twitter:title" content={seo.title} />
	<meta name="twitter:description" content={seo.description} />
	{#if seo.ogImage}
		<meta name="twitter:image" content={seo.ogImage} />
		{#if seo.ogImageAlt}<meta name="twitter:image:alt" content={seo.ogImageAlt} />{/if}
	{/if}

	<!-- JSON-LD: WebSite (site-wide) -->
	{@html `<script type="application/ld+json">${ldJson(websiteJsonLd)}</script>`}
	<!-- JSON-LD: Page-specific -->
	{#if seo.jsonLd}
		{@html `<script type="application/ld+json">${ldJson(seo.jsonLd)}</script>`}
	{/if}

	<script>
		(function () {
			const saved = localStorage.getItem('theme');
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			const isDark = saved === 'dark' || (!saved && prefersDark) || (saved === 'system' && prefersDark);
			if (isDark) document.documentElement.classList.add('dark');
		})();
	</script>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<header
		class="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80"
	>
		<nav class="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 md:py-4">
			<a
				href="/"
				class="text-base font-semibold text-gray-900 transition-colors hover:text-primary-600 md:text-lg dark:text-white dark:hover:text-primary-400"
			>
				{profile.nameEn}
			</a>

			<!-- Desktop navigation -->
			<div class="hidden items-center gap-6 md:flex">
				<ul class="flex items-center gap-6">
					<li>
						<a
							href="/#products"
							class="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
						>
							Products
						</a>
					</li>
					<li>
						<a
							href="/#oss"
							class="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
						>
							OSS
						</a>
					</li>
					<li>
						<a
							href="/writings"
							class="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
						>
							Writings
						</a>
					</li>
					<li>
						<a
							href="/#youtube"
							class="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
						>
							YouTube
						</a>
					</li>
					<!-- Rein は一時的に非表示。戻すときは true に -->
					{#if false}
						<li>
							<a
								href="/rein"
								class="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
							>
								Rein
							</a>
						</li>
					{/if}
					<li>
						<a
							href="/#contact"
							class="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
						>
							Contact
						</a>
					</li>
					<li>
						<a
							href="/ask"
							onclick={(e) => {
								e.preventDefault();
								openPalette();
							}}
							class="ai-button inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-white"
						>
							<span class="ai-sparkle" aria-hidden="true">✦</span> Ask AI
							<kbd
								class="ml-1 rounded bg-white/25 px-1.5 py-px font-sans text-[11px] font-semibold leading-none tracking-wide"
								>⌘K</kbd
							>
						</a>
					</li>
				</ul>
				<ThemeToggle />
			</div>

			<!-- Mobile menu button -->
			<button
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				class="tap-target flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 md:hidden dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
				aria-label={mobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
				aria-expanded={mobileMenuOpen}
			>
				{#if mobileMenuOpen}
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				{:else}
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				{/if}
			</button>
		</nav>
	</header>

	<!-- Mobile menu: OUTSIDE header to avoid backdrop-filter containing block -->
	<MobileMenu bind:isOpen={mobileMenuOpen} />

	<!-- ⌘K AI command palette (global) -->
	<CommandPalette />

	<main>
		{@render children()}
	</main>

	<footer class="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
		<div class="mx-auto max-w-4xl px-4 py-6 md:py-8">
			<p class="text-center text-xs text-gray-500 md:text-sm dark:text-gray-400">
				&copy; {new Date().getFullYear()} {profile.nameEn}. All rights reserved.
			</p>
		</div>
	</footer>
</div>
