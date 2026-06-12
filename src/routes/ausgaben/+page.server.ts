import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { categories, expenses, users } from '$lib/server/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { parseAmountToCents } from '$lib/utils/money';
import { isValidISODate, todayISO } from '$lib/utils/date';

export const load: PageServerLoad = async ({ url }) => {
	const rubrik = url.searchParams.get('rubrik');

	const cats = await db
		.select()
		.from(categories)
		.where(eq(categories.scope, 'ausgaben'))
		.orderBy(categories.sortOrder);

	const where = rubrik ? eq(expenses.categoryId, rubrik) : undefined;
	const list = await db
		.select({ expense: expenses, payer: users.displayName })
		.from(expenses)
		.leftJoin(users, eq(expenses.userId, users.id))
		.where(where)
		.orderBy(desc(expenses.date), desc(expenses.createdAt));

	const totalRow = await db
		.select({ total: sql<number>`coalesce(sum(${expenses.amountCents}), 0)` })
		.from(expenses)
		.where(where)
		.get();

	const members = await db
		.select({ id: users.id, displayName: users.displayName })
		.from(users)
		.where(eq(users.disabled, false));

	return { cats, list, total: totalRow?.total ?? 0, rubrik, members, today: todayISO() };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const form = await request.formData();
		const amountCents = parseAmountToCents(String(form.get('amount') ?? ''));
		const date = String(form.get('date') ?? '');
		const categoryId = String(form.get('categoryId') ?? '');
		const description = String(form.get('description') ?? '').trim();
		const payerId = String(form.get('payerId') ?? '') || locals.user!.id;
		const notes = String(form.get('notes') ?? '').trim();

		if (amountCents === null || amountCents <= 0) {
			return fail(400, { message: 'Bitte gib einen gültigen Betrag ein.' });
		}
		if (!isValidISODate(date)) return fail(400, { message: 'Ungültiges Datum.' });
		if (!categoryId) return fail(400, { message: 'Bitte wähle eine Rubrik.' });

		await db
			.insert(expenses)
			.values({ amountCents, date, categoryId, description, userId: payerId, notes });
		return { success: true };
	},
	delete: async ({ request }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (id) await db.delete(expenses).where(eq(expenses.id, id));
		return { success: true };
	}
};
