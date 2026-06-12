import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import {
	createSession,
	setSessionCookie,
	setThemeCookies,
	verifyPassword
} from '$lib/server/auth';

export const actions: Actions = {
	default: async (event) => {
		const form = await event.request.formData();
		const username = String(form.get('username') ?? '')
			.trim()
			.toLowerCase();
		const password = String(form.get('password') ?? '');

		if (!username || !password) {
			return fail(400, { message: 'Bitte Benutzername und Passwort eingeben.', username });
		}
		const user = await db.select().from(users).where(eq(users.username, username)).get();
		if (!user || user.disabled || !(await verifyPassword(user.passwordHash, password))) {
			return fail(400, { message: 'Benutzername oder Passwort ist falsch.', username });
		}

		const { token, expiresAt } = await createSession(user.id);
		setSessionCookie(event, token, expiresAt);
		setThemeCookies(event, user.theme, user.accentColor);
		redirect(303, '/');
	}
};
