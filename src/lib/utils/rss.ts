import { XMLParser } from 'fast-xml-parser';
import type { Article, ArticleSource, YouTubePlaylist, YouTubeVideo } from '$lib/types';

// YouTube Data API v3 response types
interface YouTubeAPIResponse {
	items?: Array<{
		snippet: {
			publishedAt: string;
			title: string;
			description: string;
			thumbnails: {
				high?: { url: string };
			};
			channelTitle: string;
			resourceId: {
				videoId: string;
			};
		};
	}>;
}

interface RSSItem {
	title: string;
	link: string;
	pubDate: string;
	description?: string;
	enclosure?: {
		'@_url'?: string;
	};
}

interface RSSChannel {
	item: RSSItem | RSSItem[];
}

interface RSSFeed {
	rss: {
		channel: RSSChannel;
	};
}

const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: '@_'
});

function detectSource(url: string): ArticleSource {
	if (url.includes('zenn.dev')) return 'zenn';
	if (url.includes('note.com')) return 'note';
	return 'other';
}

function parseRSSItems(xml: string, source: ArticleSource): Article[] {
	const feed = parser.parse(xml) as RSSFeed;
	const items = feed.rss.channel.item;
	const itemArray = Array.isArray(items) ? items : [items];

	return itemArray.map((item) => ({
		title: item.title,
		url: item.link,
		publishedAt: item.pubDate,
		description: item.description,
		thumbnail: item.enclosure?.['@_url'],
		source
	}));
}

export async function fetchArticlesFromRSS(
	feedUrl: string,
	fetcher: typeof fetch
): Promise<Article[]> {
	const source = detectSource(feedUrl);

	const response = await fetcher(feedUrl);
	if (!response.ok) {
		console.error(`Failed to fetch RSS feed: ${response.status}`);
		return [];
	}

	const xml = await response.text();
	return parseRSSItems(xml, source);
}

export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('ja-JP', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}

export async function fetchYouTubeChannel(
	channelId: string,
	apiKey: string,
	maxResults: number = 4
): Promise<YouTubePlaylist | null> {
	const uploadsPlaylistId = 'UU' + channelId.slice(2);
	const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${apiKey}`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			console.error(`Failed to fetch YouTube API: ${response.status}`);
			return null;
		}

		const data = (await response.json()) as YouTubeAPIResponse;
		if (!data.items?.length) {
			console.error('No items found in YouTube API response');
			return null;
		}

		const videos: YouTubeVideo[] = data.items.map((item) => ({
			videoId: item.snippet.resourceId.videoId,
			title: item.snippet.title,
			url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
			publishedAt: item.snippet.publishedAt,
			description: item.snippet.description,
			thumbnail:
				item.snippet.thumbnails.high?.url ??
				`https://i.ytimg.com/vi/${item.snippet.resourceId.videoId}/hqdefault.jpg`
		}));

		return {
			playlistId: uploadsPlaylistId,
			title: data.items[0].snippet.channelTitle,
			channelName: data.items[0].snippet.channelTitle,
			channelUrl: `https://www.youtube.com/channel/${channelId}`,
			videos
		};
	} catch (error) {
		console.error('Error fetching YouTube channel:', error);
		return null;
	}
}
