<script lang="ts">
	import '../app.css';
	import { profile } from '$lib/data/profile';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import MobileMenu from '$lib/components/MobileMenu.svelte';

	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	let mobileMenuOpen = $state(false);
</script>

<svelte:head>
	<meta name="description" content="{profile.name} - {profile.title}" />
	<script>
		// Prevent flash of wrong theme
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
					<li>
						<a
							href="/#contact"
							class="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
						>
							Contact
						</a>
					</li>
				</ul>
				<ThemeToggle />
			</div>

			<!-- Mobile menu button -->
			<button
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				class="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 md:hidden dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
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
