import type { Profile, Contact } from '$lib/types';

export const profile: Profile = {
	name: '谷口 恭一',
	nameEn: 'Kyoichi Taniguchi',
	title: 'iOS Engineer',
	bio: 'iOSエンジニア。Swift & SwiftUI を使ったネイティブiOSアプリ開発に情熱を注いでいます。モバイルアプリケーションへのAI統合技術も探求中。',
	avatar: '/profile.jpg',
	location: '神奈川県横浜市',
	socialLinks: [
		{
			platform: 'github',
			url: 'https://github.com/taniguchi-kyoichi',
			label: 'GitHub'
		},
		{
			platform: 'zenn',
			url: 'https://zenn.dev/kyoichi',
			label: 'Zenn'
		},
		{
			platform: 'youtube',
			url: 'https://youtube.com/@taniguchi-kyoichi',
			label: 'YouTube'
		}
	]
};

export const contact: Contact = {
	email: 'info@taniguchi-kyoichi.com',
	message: 'お仕事のご依頼やお問い合わせはメールにてご連絡ください。'
};
