import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { categories, expenses, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { parseAmountToCents } from '$lib/utils/money';
import { isValidISODate } from '$lib/utils/date';

export const load: PageServerLoad = async ({ params }) => {
	const expense = await db.select().from(expenses).where(eq(expenses.id, params.id)).get();
	if (!expense) error(404, 'Ausgabe nicht gefunden');

	const cats = await db
		.select()
		.from(categories)
		.where(eq(categories.scope, 'ausgaben'))
		.orderBy(categories.sortOrder);
	const members = await db
		.select({ id: users.id, displayName: users.displayName })
		.from(users)
		.where(eq(users.disabled, false));

	return { expense, cats, members };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const form = await request.formData();
		const amountCents = parseAmountToCents(String(form.get('amount') ?? ''));
		const date = String(form.get('date') ?? '');
		const categoryId = String(form.get('categoryId') ?? '');
		const description = String(form.get('description') ?? '').trim();
		const payerId = String(form.get('payerId') ?? '');
		const notes = String(form.get('notes') ?? '').trim();

		if (amountCents === null || amountCents <= 0) {
			return fail(400, { message: 'Bitte gib einen gültigen Betrag ein.' });
		}
		if (!isValidISODate(date)) return fail(400, { message: 'Ungültiges Datum.' });
		if (!categoryId) return fail(400, { message: 'Bitte wähle eine Rubrik.' });

		await db
			.update(expenses)
			.set({ amountCents, date, categoryId, description, userId: payerId || null, notes })
			.where(eq(expenses.id, params.id));
		redirect(303, '/ausgaben');
	},
	delete: async ({ params }) => {
		await db.delete(expenses).where(eq(expenses.id, params.id));
		redirect(303, '/ausgaben');
	}
};
