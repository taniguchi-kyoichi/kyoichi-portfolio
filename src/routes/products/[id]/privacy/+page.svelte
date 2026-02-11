<script lang="ts">
	import { profile } from '$lib/data/profile';
	import type { Product } from '$lib/types';

	interface Props {
		data: {
			product: Product;
		};
	}

	let { data }: Props = $props();
	const product = data.product;
	const privacy = product.privacy!;

	const collectionSummary: Record<string, string> = {
		none: 'は、お客様の個人情報を一切収集しません。',
		minimal: 'は、サービス提供に必要な最小限の情報のみを取り扱います。',
		standard: 'は、サービスの提供および改善のために一定の情報を収集します。'
	};
</script>

<svelte:head>
	<title>プライバシーポリシー - {product.name} | {profile.name}</title>
	<meta name="description" content="{product.name}のプライバシーポリシー" />
</svelte:head>

<article class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<div class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
		<!-- Back link -->
		<a
			href="/products/{product.id}"
			class="mb-6 inline-flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			{product.name}に戻る
		</a>

		<div class="rounded-xl bg-white p-6 shadow-sm sm:p-8 dark:bg-gray-800">
			<h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
				プライバシーポリシー
			</h1>
			<p class="mb-8 text-sm text-gray-500 dark:text-gray-400">
				{product.name} | 最終更新日: {privacy.effectiveDate}
			</p>

			<div class="space-y-8 text-gray-700 leading-relaxed dark:text-gray-300">
				<!-- 概要 -->
				<section>
					<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">概要</h2>
					<p>
						{product.name}{collectionSummary[privacy.dataCollection]}
						本プライバシーポリシーは、本アプリにおける情報の取り扱いについて説明します。
					</p>
				</section>

				<!-- 収集する情報 -->
				<section>
					<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">収集する情報</h2>
					{#if privacy.dataCollection === 'none'}
						<p>
							本アプリは個人情報を収集しません。すべてのデータはお客様の端末内にのみ保存され、
							外部サーバーへの送信は行いません。
						</p>
					{:else if privacy.dataItems && privacy.dataItems.length > 0}
						<p class="mb-3">本アプリでは、以下の情報を取り扱います:</p>
						<ul class="list-inside list-disc space-y-1">
							{#each privacy.dataItems as item}
								<li>{item}</li>
							{/each}
						</ul>
					{:else}
						<p>本アプリで取り扱う情報の詳細については、お問い合わせください。</p>
					{/if}
				</section>

				<!-- 第三者サービス -->
				{#if privacy.thirdPartyServices && privacy.thirdPartyServices.length > 0}
					<section>
						<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">第三者サービス</h2>
						<p class="mb-3">本アプリは以下の第三者サービスを利用しています:</p>
						<ul class="list-inside list-disc space-y-1">
							{#each privacy.thirdPartyServices as service}
								<li>{service}</li>
							{/each}
						</ul>
						<p class="mt-3">
							これらのサービスの利用にあたっては、各サービス提供者のプライバシーポリシーが適用されます。
						</p>
					</section>
				{/if}

				<!-- アナリティクス -->
				<section>
					<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">アナリティクス</h2>
					{#if privacy.analyticsUsed}
						<p>本アプリでは、サービス改善のためにアナリティクスツールを使用しています。</p>
					{:else}
						<p>本アプリではアナリティクスツールを使用していません。</p>
					{/if}
				</section>

				<!-- 変更について -->
				<section>
					<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">プライバシーポリシーの変更</h2>
					<p>
						本プライバシーポリシーは、必要に応じて更新されることがあります。
						重要な変更がある場合は、アプリ内またはこのページにてお知らせします。
					</p>
				</section>

				<!-- お問い合わせ -->
				<section>
					<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">お問い合わせ</h2>
					<p>
						プライバシーに関するご質問やお問い合わせは、以下のメールアドレスまでご連絡ください。
					</p>
					<p class="mt-2">
						<a
							href="mailto:{privacy.contactEmail}"
							class="text-primary-600 hover:underline dark:text-primary-400"
						>
							{privacy.contactEmail}
						</a>
					</p>
				</section>
			</div>
		</div>
	</div>
</article>
