import type { OSSProject } from '$lib/types';

export const ossProjects: OSSProject[] = [
	{
		id: 'example-oss',
		name: 'example-library',
		description: 'サンプルのOSSプロジェクト。ここに実際のリポジトリ情報を追加してください。',
		repository: 'https://github.com/kyoichi-taniguchi/example-library',
		language: 'TypeScript',
		topics: ['typescript', 'library'],
		featured: true
	}
];

export const featuredOSS = ossProjects.filter((p) => p.featured);
