import type { PageServerLoad } from './$types';
import { ossProjects } from '$lib/data/oss';
import { error } from '@sveltejs/kit';
import { profile } from '$lib/data/profile';
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_SIZE, SITE_URL } from '$lib/seo';
import type { SEO } from '$lib/seo';
import { resolveDoccUrls } from '$lib/server/docc';
import { fetchReadme, renderReadme } from '$lib/server/readme';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const project = ossProjects.find((p) => p.id === params.id);

	if (!project) {
		throw error(404, 'Project not found');
	}

	// Sibling packages in the same category. Cross-linking detail pages weaves a
	// dense internal-link mesh (each page goes from ~1 inbound link to 5–8),
	// which both helps these pages rank and lets visitors discover related work.
	const related = ossProjects.filter(
		(p) => p.id !== project.id && p.category === project.category
	);

	// README + DocC links (this package and its siblings) in one parallel batch.
	const [readme, docc] = await Promise.all([
		fetchReadme(project.repository, fetch),
		resolveDoccUrls([project, ...related])
	]);

	// README の相対リンクはリポジトリ基準なので、ここで絶対 URL に解決してから配る。
	// 素通しすると `[LICENSE](LICENSE)` が `/oss/LICENSE` になって 404 を量産する。
	const readmeHtml = readme ? renderReadme(readme) : null;

	// Front-load the package name + its one-line purpose so the SERP title carries
	// the keywords people actually search ("swift markdown", "swift router", …),
	// not just "name | 谷口恭一". og:site_name still carries the branding.
	const tagline = project.description.split('。')[0];

	const seo: SEO = {
		title: `${project.name} — ${tagline}`,
		description: project.description,
		canonical: `${SITE_URL}/oss/${project.id}`,
		ogType: 'website',
		ogImage: DEFAULT_OG_IMAGE,
		ogImageAlt: project.name,
		ogImageWidth: DEFAULT_OG_IMAGE_SIZE,
		ogImageHeight: DEFAULT_OG_IMAGE_SIZE,
		twitterCard: 'summary',
		jsonLd: {
			'@context': 'https://schema.org',
			'@type': 'SoftwareSourceCode',
			name: project.name,
			description: project.description,
			codeRepository: project.repository,
			programmingLanguage: project.language,
			...(project.topics ? { keywords: project.topics.join(', ') } : {}),
			author: { '@type': 'Person', name: profile.name, url: SITE_URL }
		}
	};

	return { project, readmeHtml, related, docc, seo };
};
