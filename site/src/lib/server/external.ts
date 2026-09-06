import { env } from '$env/dynamic/private';
import { fetchArticlesFromRSS, fetchYouTubeChannel } from '$lib/utils/rss';
import type { Article, YouTubeVideo } from '$lib/types';

/**
 * Live wrappers around Kyoichi's external services (Zenn / note / Rein RSS,
 * YouTube Data API). Used by the AI agent tools so the chat can pull and
 * summarize the latest content on demand instead of relying on static data.
 */

const ZENN_FEED = 'https://zenn.dev/kyoichi/feed';
const NOTE_FEED = 'https://note.com/note_kyoichi/rss';
const REIN_FEED = 'https://reinself.com/rss.xml';
const YOUTUBE_CHANNEL_ID = 'UCmMnuEXRsrNNcW4bVeeTI8A';

// Edge-cached fetch: external feeds change slowly, so cache 30 min to keep both
// the agent and the SSR page loads fast and avoid hammering the sources.
export const cachedFetch: typeof fetch = (input, init) =>
	fetch(input, { ...init, cf: { cacheTtl: 1800, cacheEverything: true } } as RequestInit);

function byDateDesc(a: Article, b: Article): number {
	return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

export type WritingSource = 'zenn' | 'note' | 'all';

export async function getWritings(source: WritingSource = 'all', limit = 8): Promise<Article[]> {
	const feeds = source === 'zenn' ? [ZENN_FEED] : source === 'note' ? [NOTE_FEED] : [ZENN_FEED, NOTE_FEED];
	const arrays = await Promise.all(feeds.map((url) => fetchArticlesFromRSS(url, cachedFetch)));
	return arrays.flat().sort(byDateDesc).slice(0, limit);
}

export async function getReinArticles(limit = 8): Promise<Article[]> {
	const articles = await fetchArticlesFromRSS(REIN_FEED, cachedFetch);
	return articles.sort(byDateDesc).slice(0, limit);
}

export async function getVideos(limit = 6): Promise<YouTubeVideo[]> {
	if (!env.YOUTUBE_API_KEY) return [];
	const playlist = await fetchYouTubeChannel(YOUTUBE_CHANNEL_ID, env.YOUTUBE_API_KEY, limit);
	return playlist?.videos ?? [];
}
