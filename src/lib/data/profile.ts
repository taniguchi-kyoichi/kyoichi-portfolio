import type { Profile, Contact } from '$lib/types';

export const profile: Profile = {
	name: '谷口 恭一',
	nameEn: 'Kyoichi Taniguchi',
	title: 'Software Engineer',
	bio: 'ソフトウェアエンジニア。モバイルアプリ開発、Webアプリケーション開発、インフラ構築など幅広い領域で活動しています。',
	avatar: '/avatar.png',
	location: 'Japan',
	socialLinks: [
		{
			platform: 'github',
			url: 'https://github.com/kyoichi-taniguchi',
			label: 'GitHub'
		},
		{
			platform: 'zenn',
			url: 'https://zenn.dev/kyoichi',
			label: 'Zenn'
		},
		{
			platform: 'note',
			url: 'https://note.com/kyoichi',
			label: 'note'
		},
		{
			platform: 'twitter',
			url: 'https://twitter.com/kyoichi',
			label: 'X (Twitter)'
		}
	]
};

export const contact: Contact = {
	email: 'contact@example.com',
	message: 'お仕事のご依頼やお問い合わせはメールにてご連絡ください。'
};
