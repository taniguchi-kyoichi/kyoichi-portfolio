import type { PageServerLoad } from './$types';
import { products } from '$lib/data/products';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const product = products.find((p) => p.id === params.id);

	if (!product || !product.privacy) {
		throw error(404, 'Privacy policy not found');
	}

	return { product };
};
