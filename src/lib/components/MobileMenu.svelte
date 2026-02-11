<script lang="ts">
	import { profile } from '$lib/data/profile';
	import ThemeToggle from './ThemeToggle.svelte';

	let { isOpen = $bindable(false) }: { isOpen: boolean } = $props();

	function close() {
		isOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			close();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Mobile menu overlay -->
{#if isOpen}
	<div
		class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden dark:bg-black/40"
		onclick={close}
		role="button"
		tabindex="-1"
		aria-label="メニューを閉じる"
		onkeydown={(e) => e.key === 'Enter' && close()}
	></div>
{/if}

<!-- Mobile menu panel -->
<div
	class="fixed right-0 top-0 z-50 h-full w-64 border-l border-gray-200 bg-white shadow-xl md:hidden dark:border-gray-700 dark:bg-gray-900
		{isOpen ? 'translate-x-0' : 'translate-x-full'}
		transition-transform duration-300 ease-in-out"
>
	<div class="flex h-full flex-col">
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-gray-700">
			<span class="text-lg font-semibold text-gray-900 dark:text-white">{profile.nameEn}</span>
			<button
				onclick={close}
				class="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
				aria-label="メニューを閉じる"
			>
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 px-4 py-6">
			<ul class="space-y-2">
				<li>
					<a
						href="/#products"
						onclick={close}
						class="flex h-12 items-center rounded-lg px-4 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
					>
						Products
					</a>
				</li>
				<li>
					<a
						href="/#oss"
						onclick={close}
						class="flex h-12 items-center rounded-lg px-4 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
					>
						OSS
					</a>
				</li>
				<li>
					<a
						href="/writings"
						onclick={close}
						class="flex h-12 items-center rounded-lg px-4 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
					>
						Writings
					</a>
				</li>
				<li>
					<a
						href="/#youtube"
						onclick={close}
						class="flex h-12 items-center rounded-lg px-4 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
					>
						YouTube
					</a>
				</li>
				<li>
					<a
						href="/#contact"
						onclick={close}
						class="flex h-12 items-center rounded-lg px-4 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
					>
						Contact
					</a>
				</li>
			</ul>
		</nav>

		<!-- Footer -->
		<div class="border-t border-gray-200 px-4 py-4 dark:border-gray-700">
			<div class="flex items-center justify-between">
				<span class="text-sm text-gray-500 dark:text-gray-400">テーマ</span>
				<ThemeToggle />
			</div>
		</div>
	</div>
</div>
