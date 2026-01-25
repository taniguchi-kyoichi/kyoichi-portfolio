<script lang="ts">
	import { browser } from '$app/environment';

	type Theme = 'light' | 'dark' | 'system';

	let theme = $state<Theme>('system');

	function getSystemTheme(): 'light' | 'dark' {
		if (!browser) return 'light';
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	function applyTheme(t: Theme) {
		if (!browser) return;
		const isDark = t === 'dark' || (t === 'system' && getSystemTheme() === 'dark');
		document.documentElement.classList.toggle('dark', isDark);
	}

	function cycleTheme() {
		const order: Theme[] = ['light', 'dark', 'system'];
		const currentIndex = order.indexOf(theme);
		theme = order[(currentIndex + 1) % order.length];
		localStorage.setItem('theme', theme);
		applyTheme(theme);
	}

	$effect(() => {
		if (!browser) return;

		// Load saved theme
		const saved = localStorage.getItem('theme') as Theme | null;
		if (saved && ['light', 'dark', 'system'].includes(saved)) {
			theme = saved;
		}
		applyTheme(theme);

		// Listen for system theme changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = () => {
			if (theme === 'system') {
				applyTheme('system');
			}
		};
		mediaQuery.addEventListener('change', handler);

		return () => mediaQuery.removeEventListener('change', handler);
	});
</script>

<button
	onclick={cycleTheme}
	class="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
	aria-label="テーマ切り替え"
	title={theme === 'light' ? 'ライトモード' : theme === 'dark' ? 'ダークモード' : 'システム設定'}
>
	{#if theme === 'light'}
		<!-- Sun icon -->
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
			/>
		</svg>
	{:else if theme === 'dark'}
		<!-- Moon icon -->
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
			/>
		</svg>
	{:else}
		<!-- Computer icon (system) -->
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
			/>
		</svg>
	{/if}
</button>
