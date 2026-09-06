import { cachedFetch } from './external';

/**
 * Resolve a package's published DocC site the way swift-oss-doctor does: the
 * hosted index.json names the canonical documentation root (a combined doc lives
 * at /documentation, a single module at /documentation/<module>). Probing it
 * keeps the link self-healing — present only while the DocC site is live, with no
 * data to sync from the package repos. Uses the edge-cached fetch so listing
 * pages can resolve many packages cheaply.
 */
async function resolveDoccUrl(repository: string): Promise<string | null> {
	const repoMatch = repository.match(/github\.com\/([^/]+)\/([^/]+)/);
	if (!repoMatch) return null;

	const [, owner, repo] = repoMatch;
	const base = `https://${owner}.github.io/${repo}`;

	try {
		const res = await cachedFetch(`${base}/index/index.json`);
		if (!res.ok) return null;
		const data = await res.json();
		const path = data?.interfaceLanguages?.swift?.[0]?.path;
		return typeof path === 'string' ? `${base}${path}` : null;
	} catch {
		return null;
	}
}

/** Resolve DocC URLs for many packages in parallel, keyed by project id. */
export async function resolveDoccUrls(
	projects: { id: string; repository: string }[]
): Promise<Record<string, string | null>> {
	const entries = await Promise.all(
		projects.map(async (p) => [p.id, await resolveDoccUrl(p.repository)] as const)
	);
	return Object.fromEntries(entries);
}
