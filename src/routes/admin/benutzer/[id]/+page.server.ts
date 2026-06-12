import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { diaryEntries, expenses, foodLog, users } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { hashPassword, invalidateUserSessions } from '$lib/server/auth';

async function entryCount(userId: string): Promise<number> {
	const [e, f, d] = await Promise.all([
		db.select({ n: sql<number>`count(*)` }).from(expenses).where(eq(expenses.userId, userId)).get(),
		db.select({ n: sql<number>`count(*)` }).from(foodLog).where(eq(foodLog.userId, userId)).get(),
		db
			.select({ n: sql<number>`count(*)` })
			.from(diaryEntries)
			.where(eq(diaryEntries.userId, userId))
			.get()
	]);
	return (e?.n ?? 0) + (f?.n ?? 0) + (d?.n ?? 0);
}

export const load: PageServerLoad = async ({ params }) => {
	const user = await db
		.select({
			id: users.id,
			username: users.username,
			displayName: users.displayName,
			isAdmin: users.isAdmin,
			disabled: users.disabled
		})
		.from(users)
		.where(eq(users.id, params.id))
		.get();
	if (!user) error(404, 'Benutzer nicht gefunden');

	return { managedUser: user, entryCount: await entryCount(params.id) };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const form = await request.formData();
		const displayName = String(form.get('displayName') ?? '').trim();
		const isAdmin = form.get('isAdmin') === 'on';

		if (!displayName) return fail(400, { message: 'Bitte gib einen Anzeigenamen ein.' });
		if (params.id === locals.user!.id && !isAdmin) {
			return fail(400, { message: 'Du kannst dir nicht selbst die Admin-Rechte entziehen.' });
		}
		await db.update(users).set({ displayName, isAdmin }).where(eq(users.id, params.id));
		return { success: true };
	},

	resetPassword: async ({ request, params }) => {
		const form = await request.formData();
		const next = String(form.get('next') ?? '');
		if (next.length < 8) {
			return fail(400, { message: 'Das Passwort braucht mindestens 8 Zeichen.' });
		}
		await db
			.update(users)
			.set({ passwordHash: await hashPassword(next) })
			.where(eq(users.id, params.id));
		await invalidateUserSessions(params.id);
		return { success: true };
	},

	toggleDisabled: async ({ params, locals }) => {
		if (params.id === locals.user!.id) {
			return fail(400, { message: 'Du kannst dich nicht selbst deaktivieren.' });
		}
		const user = await db.select().from(users).where(eq(users.id, params.id)).get();
		if (!user) error(404, 'Benutzer nicht gefunden');
		await db.update(users).set({ disabled: !user.disabled }).where(eq(users.id, params.id));
		if (!user.disabled) await invalidateUserSessions(params.id);
		return { success: true };
	},

	delete: async ({ params, locals }) => {
		if (params.id === locals.user!.id) {
			return fail(400, { message: 'Du kannst dich nicht selbst löschen.' });
		}
		if ((await entryCount(params.id)) > 0) {
			return fail(400, {
				message: 'Dieser Benutzer hat Einträge — deaktiviere ihn stattdessen.'
			});
		}
		await db.delete(users).where(eq(users.id, params.id));
		redirect(303, '/admin/benutzer');
	}
};
