import { redirect, type Handle } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import {
	SESSION_COOKIE,
	deleteSessionCookie,
	setSessionCookie,
	validateSessionToken
} from '$lib/server/auth';

// Solange keine Benutzer existieren, leitet alles auf /setup (First-Run).
// Sobald der erste Admin angelegt ist, bleibt das Flag für die Prozesslaufzeit true.
let setupDone = false;
async function needsSetup(): Promise<boolean> {
	if (setupDone) return false;
	const row = await db.select({ id: users.id }).from(users).limit(1).get();
	if (row) {
		setupDone = true;
		return false;
	}
	return true;
}

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	event.locals.user = null;
	event.locals.sessionId = null;
	const token = event.cookies.get(SESSION_COOKIE);
	if (token) {
		const result = await validateSessionToken(token);
		if (result) {
			event.locals.user = result.user;
			event.locals.sessionId = result.sessionId;
			setSessionCookie(event, token, result.expiresAt); // gleitende Verlängerung
		} else {
			deleteSessionCookie(event);
		}
	}

	if (await needsSetup()) {
		if (pathname !== '/setup') redirect(303, '/setup');
	} else if (pathname === '/setup') {
		redirect(303, event.locals.user ? '/' : '/login');
	} else if (!event.locals.user) {
		if (pathname !== '/login') redirect(303, '/login');
	} else if (pathname === '/login') {
		redirect(303, '/');
	} else if (pathname.startsWith('/admin') && !event.locals.user.isAdmin) {
		redirect(303, '/');
	}

	const theme = event.locals.user?.theme ?? event.cookies.get('theme') ?? 'system';
	const accent = event.locals.user?.accentColor ?? event.cookies.get('accent') ?? 'blue';

	return resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('%app.theme%', theme).replace('%app.accent%', accent)
	});
};
