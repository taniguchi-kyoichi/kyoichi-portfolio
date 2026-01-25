import { XMLParser } from 'fast-xml-parser';
import type { Article, ArticleSource, YouTubePlaylist, YouTubeVideo } from '$lib/types';

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

// YouTube RSS types
interface YouTubeRSSEntry {
	'yt:videoId': string;
	title: string;
	link: { '@_href': string };
	published: string;
	'media:group': {
		'media:description': string;
		'media:thumbnail': { '@_url': string };
	};
}

interface YouTubeRSSFeed {
	feed: {
		'yt:playlistId': string;
		title: string;
		author: {
			name: string;
			uri: string;
		};
		entry: YouTubeRSSEntry | YouTubeRSSEntry[];
	};
}

export async function fetchYouTubePlaylist(
	playlistId: string,
	fetcher: typeof fetch
): Promise<YouTubePlaylist | null> {
	const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;

	try {
		const response = await fetcher(feedUrl);
		if (!response.ok) {
			console.error(`Failed to fetch YouTube RSS: ${response.status}`);
			return null;
		}

		const xml = await response.text();
		const feed = parser.parse(xml) as YouTubeRSSFeed;

		const entries = feed.feed.entry;
		if (!entries) {
			console.error('No entries found in YouTube RSS');
			return null;
		}

		const entryArray = Array.isArray(entries) ? entries : [entries];

		const videos: YouTubeVideo[] = entryArray.map((entry) => ({
			videoId: entry['yt:videoId'],
			title: entry.title,
			url: entry.link['@_href'],
			publishedAt: entry.published,
			description: entry['media:group']?.['media:description'] ?? '',
			thumbnail: entry['media:group']?.['media:thumbnail']?.['@_url'] ?? `https://i.ytimg.com/vi/${entry['yt:videoId']}/hqdefault.jpg`
		}));

		return {
			playlistId: feed.feed['yt:playlistId'],
			title: feed.feed.title,
			channelName: feed.feed.author.name,
			channelUrl: feed.feed.author.uri,
			videos
		};
	} catch (error) {
		console.error('Error fetching YouTube playlist:', error);
		return null;
	}
}
