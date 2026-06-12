import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { categories, foodLog } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { isValidISODate } from '$lib/utils/date';

export const load: PageServerLoad = async ({ params }) => {
	const entry = await db.select().from(foodLog).where(eq(foodLog.id, params.id)).get();
	if (!entry) error(404, 'Eintrag nicht gefunden');

	const cats = await db
		.select()
		.from(categories)
		.where(eq(categories.scope, 'essen'))
		.orderBy(categories.sortOrder);

	return { entry, cats };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const form = await request.formData();
		const item = String(form.get('item') ?? '').trim();
		const quantity = String(form.get('quantity') ?? '').trim();
		const date = String(form.get('date') ?? '');
		const categoryId = String(form.get('categoryId') ?? '');
		const notes = String(form.get('notes') ?? '').trim();

		if (!item) return fail(400, { message: 'Bitte gib an, worum es geht.' });
		if (!isValidISODate(date)) return fail(400, { message: 'Ungültiges Datum.' });
		if (!categoryId) return fail(400, { message: 'Bitte wähle eine Rubrik.' });

		await db
			.update(foodLog)
			.set({ item, quantity, date, categoryId, notes })
			.where(eq(foodLog.id, params.id));
		redirect(303, '/essen');
	},
	delete: async ({ params }) => {
		await db.delete(foodLog).where(eq(foodLog.id, params.id));
		redirect(303, '/essen');
	}
};
