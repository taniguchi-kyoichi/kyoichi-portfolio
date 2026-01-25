<script lang="ts">
	import { profile, contact } from '$lib/data/profile';
	import { products } from '$lib/data/products';
	import { featuredOSS, ossProjects } from '$lib/data/oss';
	import SocialIcon from '$lib/components/SocialIcon.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import OSSCard from '$lib/components/OSSCard.svelte';
</script>

<svelte:head>
	<title>{profile.name} | {profile.title}</title>
</svelte:head>

<!-- Hero Section -->
<section class="relative overflow-hidden bg-white dark:bg-gray-900">
	<div class="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-20 lg:px-8">
		<div class="flex flex-col items-center text-center">
			{#if profile.avatar}
				<img
					src={profile.avatar}
					alt={profile.name}
					class="mb-4 h-24 w-24 rounded-full object-cover shadow-lg ring-4 ring-white sm:mb-6 sm:h-28 sm:w-28 md:h-32 md:w-32 dark:ring-gray-800"
				/>
			{:else}
				<div
					class="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-3xl font-bold text-white shadow-lg sm:mb-6 sm:h-28 sm:w-28 sm:text-4xl md:h-32 md:w-32"
				>
					{profile.name.charAt(0)}
				</div>
			{/if}

			<h1 class="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl dark:text-white">
				{profile.name}
			</h1>
			<p class="mb-3 text-base text-primary-600 sm:mb-4 sm:text-lg dark:text-primary-400">
				{profile.title}
			</p>

			{#if profile.location}
				<p class="mb-4 flex items-center gap-1.5 text-sm text-gray-500 sm:mb-6 dark:text-gray-400">
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
					{profile.location}
				</p>
			{/if}

			<p class="mb-6 max-w-2xl text-sm text-gray-600 sm:mb-8 sm:text-base dark:text-gray-300">
				{profile.bio}
			</p>

			<!-- Social Links -->
			<div class="flex flex-wrap justify-center gap-2 sm:gap-3">
				{#each profile.socialLinks as link}
					<a
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 sm:px-4 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-primary-600 dark:hover:bg-gray-700 dark:hover:text-primary-400"
						aria-label={link.label}
					>
						<SocialIcon platform={link.platform} class="h-5 w-5" />
						<span class="hidden xs:inline sm:inline">{link.label}</span>
					</a>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- Products Section -->
{#if products.length > 0}
	<section id="products" class="bg-gray-50 py-12 md:py-20 dark:bg-gray-800/50">
		<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
			<h2 class="mb-2 text-center text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
				Products
			</h2>
			<p class="mb-8 text-center text-sm text-gray-600 sm:mb-12 sm:text-base dark:text-gray-400">
				公開しているアプリケーション・サービス
			</p>

			<div class="grid gap-4 sm:gap-6 md:grid-cols-2">
				{#each products as product}
					<ProductCard {product} />
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- OSS Section -->
{#if ossProjects.length > 0}
	<section id="oss" class="bg-white py-12 md:py-20 dark:bg-gray-900">
		<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
			<h2 class="mb-2 text-center text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
				Open Source
			</h2>
			<p class="mb-8 text-center text-sm text-gray-600 sm:mb-12 sm:text-base dark:text-gray-400">
				公開しているOSSプロジェクト
			</p>

			<div class="grid gap-4 sm:gap-6 md:grid-cols-2">
				{#each featuredOSS as project}
					<OSSCard {project} />
				{/each}
			</div>

			{#if ossProjects.length > featuredOSS.length}
				<div class="mt-8 text-center sm:mt-12">
					<a
						href="/oss"
						class="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-primary-600 dark:hover:bg-gray-700 dark:hover:text-primary-400"
					>
						すべてのOSSを見る
						<span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">
							{ossProjects.length}
						</span>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</a>
				</div>
			{/if}
		</div>
	</section>
{/if}

<!-- Contact Section -->
<section id="contact" class="bg-gray-50 py-12 md:py-20 dark:bg-gray-800/50">
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
		<h2 class="mb-2 text-center text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
			Contact
		</h2>
		<p class="mb-8 text-center text-sm text-gray-600 sm:mb-12 sm:text-base dark:text-gray-400">
			お問い合わせ
		</p>

		<div
			class="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 dark:border-gray-700 dark:bg-gray-800"
		>
			{#if contact.message}
				<p class="mb-4 text-center text-sm text-gray-600 sm:mb-6 sm:text-base dark:text-gray-300">
					{contact.message}
				</p>
			{/if}

			<div class="flex flex-col items-center gap-3 sm:gap-4">
				{#if contact.email}
					<a
						href="mailto:{contact.email}"
						class="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 sm:w-auto dark:bg-primary-500 dark:hover:bg-primary-600"
					>
						<SocialIcon platform="email" class="h-5 w-5" />
						メールで問い合わせる
					</a>
				{/if}

				{#if contact.formUrl}
					<a
						href={contact.formUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 sm:w-auto dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
					>
						フォームで問い合わせる
					</a>
				{/if}
			</div>
		</div>
	</div>
</section>
