import type { PageServerLoad } from './$types';
import { products } from '$lib/data/products';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const product = products.find((p) => p.id === params.id);

	if (!product) {
		throw error(404, 'Product not found');
	}

	return { product };
};
