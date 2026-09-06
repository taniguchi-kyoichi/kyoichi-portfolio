import type { RequestHandler } from './$types';
import { ossProjects } from '$lib/data/oss';
import { error } from '@sveltejs/kit';
import { SITE_URL } from '$lib/seo';
import { fetchReadme } from '$lib/server/readme';

export const GET: RequestHandler = async ({ params, fetch, setHeaders }) => {
	const project = ossProjects.find((p) => p.id === params.id);

	if (!project) {
		throw error(404, 'Project not found');
	}

	setHeaders({
		'content-type': 'text/markdown; charset=utf-8',
		'cache-control': 'public, max-age=3600, stale-while-revalidate=86400'
	});

	const readme = await fetchReadme(project.repository, fetch);

	const lines: string[] = [];
	lines.push(`# ${project.name}`);
	lines.push('');
	lines.push(`> ${project.description}`);
	lines.push('');

	lines.push('## Overview');
	lines.push('');
	lines.push(`- **Language**: ${project.language}`);
	if (project.topics && project.topics.length > 0) {
		lines.push(`- **Topics**: ${project.topics.join(', ')}`);
	}
	lines.push(`- **Repository**: ${project.repository}`);
	if (project.homepage) lines.push(`- **Homepage**: ${project.homepage}`);
	lines.push(`- **Page**: ${SITE_URL}/oss/${project.id}`);
	lines.push('');

	if (readme) {
		lines.push('## README');
		lines.push('');
		// 本文はリポジトリの README をそのまま載せる。中の相対リンクはリポジトリ基準なので、
		// 読み手（人でも LLM でも）が解決できるように基準を先に示しておく。
		lines.push(
			`> Source: https://github.com/${readme.owner}/${readme.repo}/blob/${readme.branch}/README.md` +
				` — relative links in the body resolve against that repository, not against ${SITE_URL}.`
		);
		lines.push('');
		lines.push(readme.markdown);
	}

	return new Response(lines.join('\n'));
};
