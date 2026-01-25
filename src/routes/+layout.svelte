<script lang="ts">
	import '../app.css';
	import { profile } from '$lib/data/profile';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import MobileMenu from '$lib/components/MobileMenu.svelte';

	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();
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

			<!-- Mobile menu -->
			<MobileMenu />
		</nav>
	</header>

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
