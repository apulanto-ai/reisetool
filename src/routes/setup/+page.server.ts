import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { createSession, hashPassword, setSessionCookie } from '$lib/server/auth';
import { seedDefaultCategories } from '$lib/server/seed';
import { setSetting } from '$lib/server/settings';
import { isValidISODate } from '$lib/utils/date';

export const actions: Actions = {
	default: async (event) => {
		// Doppelte Absicherung gegen parallele Setups — hooks leiten sonst schon um
		const existing = await db.select({ id: users.id }).from(users).limit(1).get();
		if (existing) redirect(303, '/login');

		const form = await event.request.formData();
		const tripName = String(form.get('tripName') ?? '').trim();
		const tripStartDate = String(form.get('tripStartDate') ?? '').trim();
		const username = String(form.get('username') ?? '')
			.trim()
			.toLowerCase();
		const displayName = String(form.get('displayName') ?? '').trim();
		const password = String(form.get('password') ?? '');
		const password2 = String(form.get('password2') ?? '');

		const values = { tripName, tripStartDate, username, displayName };
		if (!tripName) return fail(400, { message: 'Bitte gib der Reise einen Namen.', ...values });
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
		if (password !== password2) {
			return fail(400, { message: 'Die Passwörter stimmen nicht überein.', ...values });
		}
		if (tripStartDate && !isValidISODate(tripStartDate)) {
			return fail(400, { message: 'Ungültiges Startdatum.', ...values });
		}

		const passwordHash = await hashPassword(password);
		const [admin] = await db
			.insert(users)
			.values({ username, displayName, passwordHash, isAdmin: true })
			.returning();

		await seedDefaultCategories();
		await setSetting('tripName', tripName);
		if (tripStartDate) await setSetting('tripStartDate', tripStartDate);
		await setSetting('setupComplete', '1');

		const { token, expiresAt } = await createSession(admin.id);
		setSessionCookie(event, token, expiresAt);
		redirect(303, '/');
	}
};
