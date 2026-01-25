import type { PageServerLoad } from './$types';
import { ossProjects } from '$lib/data/oss';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const project = ossProjects.find((p) => p.id === params.id);

	if (!project) {
		throw error(404, 'Project not found');
	}

	// Extract owner and repo from repository URL
	const repoMatch = project.repository.match(/github\.com\/([^/]+)\/([^/]+)/);
	if (!repoMatch) {
		return { project, readme: null };
	}

	const [, owner, repo] = repoMatch;

	try {
		// Fetch README from GitHub raw content
		const readmeResponse = await fetch(
			`https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`
		);

		if (!readmeResponse.ok) {
			// Try master branch if main doesn't exist
			const masterResponse = await fetch(
				`https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`
			);
			if (!masterResponse.ok) {
				return { project, readme: null };
			}
			const readme = await masterResponse.text();
			return { project, readme };
		}

		const readme = await readmeResponse.text();
		return { project, readme };
	} catch {
		return { project, readme: null };
	}
};
