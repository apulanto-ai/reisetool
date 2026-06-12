import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '$lib/server/auth';

export const load: PageServerLoad = async () => {
	const list = await db
		.select({
			id: users.id,
			username: users.username,
			displayName: users.displayName,
			isAdmin: users.isAdmin,
			disabled: users.disabled
		})
		.from(users)
		.orderBy(users.createdAt);
	return { list };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const username = String(form.get('username') ?? '')
			.trim()
			.toLowerCase();
		const displayName = String(form.get('displayName') ?? '').trim();
		const password = String(form.get('password') ?? '');
		const isAdmin = form.get('isAdmin') === 'on';

		const values = { username, displayName };
		if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
			return fail(400, {
				message: 'Benutzername: 3–32 Zeichen, nur Kleinbuchstaben, Zahlen, Punkt, - und _.',
				...values
			});
		}
		if (!displayName) return fail(400, { message: 'Bitte gib einen Anzeigenamen ein.', ...values });
		if (password.length < 8) {
			return fail(400, { message: 'Das Passwort braucht mindestens 8 Zeichen.', ...values });
		}
		const existing = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.username, username))
			.get();
		if (existing) {
			return fail(400, { message: 'Diesen Benutzernamen gibt es schon.', ...values });
		}

		await db.insert(users).values({
			username,
			displayName,
			passwordHash: await hashPassword(password),
			isAdmin
		});
		return { success: true };
	}
};
