import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { fetchArticlesFromRSS, fetchYouTubeChannel } from '$lib/utils/rss';

const RSS_FEEDS = ['https://zenn.dev/kyoichi/feed', 'https://note.com/note_kyoichi/rss'];
const YOUTUBE_CHANNEL_ID = 'UCmMnuEXRsrNNcW4bVeeTI8A';
const MAX_ARTICLES_ON_HOME = 4;
const MAX_VIDEOS_ON_HOME = 4;

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
	// Set cache headers for edge caching
	setHeaders({
		'cache-control': 'public, max-age=3600, stale-while-revalidate=86400'
	});

	const youtubePromise = env.YOUTUBE_API_KEY
		? fetchYouTubeChannel(YOUTUBE_CHANNEL_ID, env.YOUTUBE_API_KEY, MAX_VIDEOS_ON_HOME)
		: Promise.resolve(null);

	const [articlesArrays, youtubePlaylist] = await Promise.all([
		Promise.all(RSS_FEEDS.map((url) => fetchArticlesFromRSS(url, fetch))),
		youtubePromise
	]);

	// Flatten, sort by date (newest first), and take top N
	const articles = articlesArrays
		.flat()
		.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
		.slice(0, MAX_ARTICLES_ON_HOME);

	return { articles, youtubePlaylist };
};
