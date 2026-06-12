import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import { asc, eq } from 'drizzle-orm';
import { CATEGORY_COLORS } from '$lib/utils/colors';

const SCOPES = ['ausgaben', 'essen'];

export const load: PageServerLoad = async () => {
	const list = await db.select().from(categories).orderBy(asc(categories.sortOrder));
	return {
		ausgaben: list.filter((c) => c.scope === 'ausgaben'),
		essen: list.filter((c) => c.scope === 'essen')
	};
};

async function normalizeOrder(scope: string): Promise<void> {
	const list = await db
		.select()
		.from(categories)
		.where(eq(categories.scope, scope))
		.orderBy(asc(categories.sortOrder));
	for (const [i, cat] of list.entries()) {
		if (cat.sortOrder !== i) {
			await db.update(categories).set({ sortOrder: i }).where(eq(categories.id, cat.id));
		}
	}
}

export const actions: Actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const scope = String(form.get('scope') ?? '');
		const name = String(form.get('name') ?? '').trim();
		const color = String(form.get('color') ?? 'gray');
		const icon = String(form.get('icon') ?? '').trim().slice(0, 8);

		if (!SCOPES.includes(scope)) return fail(400, { message: 'Ungültiger Bereich.' });
		if (!name) return fail(400, { message: 'Bitte gib einen Namen ein.', scope });
		if (!(color in CATEGORY_COLORS)) return fail(400, { message: 'Ungültige Farbe.', scope });

		const existing = await db.select().from(categories).where(eq(categories.scope, scope));
		await db.insert(categories).values({ scope, name, color, icon, sortOrder: existing.length });
		return { success: true, scope };
	},

	update: async ({ request }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const name = String(form.get('name') ?? '').trim();
		const color = String(form.get('color') ?? 'gray');
		const icon = String(form.get('icon') ?? '').trim().slice(0, 8);

		if (!name) return fail(400, { message: 'Bitte gib einen Namen ein.' });
		if (!(color in CATEGORY_COLORS)) return fail(400, { message: 'Ungültige Farbe.' });
		await db.update(categories).set({ name, color, icon }).where(eq(categories.id, id));
		return { success: true };
	},

	move: async ({ request }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const dir = String(form.get('dir') ?? '') === 'up' ? -1 : 1;

		const cat = await db.select().from(categories).where(eq(categories.id, id)).get();
		if (!cat) return fail(404, { message: 'Rubrik nicht gefunden.' });

		await normalizeOrder(cat.scope);
		const list = await db
			.select()
			.from(categories)
			.where(eq(categories.scope, cat.scope))
			.orderBy(asc(categories.sortOrder));
		const index = list.findIndex((c) => c.id === id);
		const target = index + dir;
		if (index < 0 || target < 0 || target >= list.length) return { success: true };

		await db.update(categories).set({ sortOrder: target }).where(eq(categories.id, list[index].id));
		await db.update(categories).set({ sortOrder: index }).where(eq(categories.id, list[target].id));
		return { success: true };
	},

	toggle: async ({ request }) => {
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const cat = await db.select().from(categories).where(eq(categories.id, id)).get();
		if (!cat) return fail(404, { message: 'Rubrik nicht gefunden.' });
		await db.update(categories).set({ disabled: !cat.disabled }).where(eq(categories.id, id));
		return { success: true };
	}
};
