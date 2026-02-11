export type SocialPlatform =
	| 'github'
	| 'zenn'
	| 'note'
	| 'twitter'
	| 'linkedin'
	| 'youtube'
	| 'email'
	| 'website';

export interface SocialLink {
	platform: SocialPlatform;
	url: string;
	label: string;
}

export interface Profile {
	name: string;
	nameEn: string;
	title: string;
	bio: string;
	avatar?: string;
	location?: string;
	socialLinks: SocialLink[];
}

export type ProductType = 'app' | 'web' | 'service' | 'library';
export type ProductStatus = 'production' | 'development' | 'archived';
export type Platform = 'ios' | 'android' | 'web' | 'macos' | 'windows' | 'linux' | 'cli';

export interface ProductLinks {
	appStore?: string;
	googlePlay?: string;
	web?: string;
	github?: string;
	docs?: string;
}

export interface PrivacyConfig {
	effectiveDate: string;
	dataCollection: 'none' | 'minimal' | 'standard';
	dataItems?: string[];
	thirdPartyServices?: string[];
	analyticsUsed?: boolean;
	contactEmail: string;
}

export interface SupportConfig {
	contactEmail: string;
	faq?: { question: string; answer: string }[];
	systemRequirements?: string;
}

export interface Product {
	id: string;
	name: string;
	description: string;
	fullDescription?: string;
	type: ProductType;
	status: ProductStatus;
	platforms: Platform[];
	links: ProductLinks;
	technologies: string[];
	thumbnail?: string;
	screenshots?: string[];
	releaseDate?: string;
	featured?: boolean;
	version?: string;
	rating?: number;
	ratingCount?: number;
	price?: string;
	category?: string;
	ageRating?: string;
	features?: string[];
	privacy?: PrivacyConfig;
	support?: SupportConfig;
}

export interface OSSProject {
	id: string;
	name: string;
	description: string;
	repository: string;
	language: string;
	topics?: string[];
	homepage?: string;
	featured?: boolean;
}

export interface Contact {
	email?: string;
	formUrl?: string;
	message?: string;
}

export type ArticleSource = 'zenn' | 'note' | 'other';

export interface Article {
	title: string;
	url: string;
	publishedAt: string;
	description?: string;
	thumbnail?: string;
	source: ArticleSource;
}

export interface YouTubeVideo {
	videoId: string;
	title: string;
	url: string;
	publishedAt: string;
	description?: string;
	thumbnail: string;
}

export interface YouTubePlaylist {
	playlistId: string;
	title: string;
	channelName: string;
	channelUrl: string;
	videos: YouTubeVideo[];
}
