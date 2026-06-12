import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { categories, foodLog, users } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { isValidISODate, todayISO } from '$lib/utils/date';

export const load: PageServerLoad = async ({ url }) => {
	const rubrik = url.searchParams.get('rubrik');

	const cats = await db
		.select()
		.from(categories)
		.where(eq(categories.scope, 'essen'))
		.orderBy(categories.sortOrder);

	const list = await db
		.select({ entry: foodLog, person: users.displayName })
		.from(foodLog)
		.leftJoin(users, eq(foodLog.userId, users.id))
		.where(rubrik ? eq(foodLog.categoryId, rubrik) : undefined)
		.orderBy(desc(foodLog.date), desc(foodLog.createdAt));

	return { cats, list, rubrik, today: todayISO() };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
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
			.insert(foodLog)
			.values({ item, quantity, date, categoryId, notes, userId: locals.user!.id });
		return { success: true };
	},
	delete: async ({ request }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (id) await db.delete(foodLog).where(eq(foodLog.id, id));
		return { success: true };
	}
};
