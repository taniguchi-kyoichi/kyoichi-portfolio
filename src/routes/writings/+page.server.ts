import type { PageServerLoad } from './$types';
import { fetchArticlesFromRSS } from '$lib/utils/rss';

const RSS_FEEDS = ['https://zenn.dev/kyoichi/feed', 'https://note.com/note_kyoichi/rss'];

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
	// Set cache headers for edge caching
	setHeaders({
		'cache-control': 'public, max-age=3600, stale-while-revalidate=86400'
	});

	const articlesArrays = await Promise.all(RSS_FEEDS.map((url) => fetchArticlesFromRSS(url, fetch)));

	// Flatten and sort by date (newest first)
	const articles = articlesArrays
		.flat()
		.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

	return { articles };
};
