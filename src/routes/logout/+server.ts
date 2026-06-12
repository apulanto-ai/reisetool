import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteSessionCookie, invalidateSession } from '$lib/server/auth';

export const POST: RequestHandler = async (event) => {
	if (event.locals.sessionId) await invalidateSession(event.locals.sessionId);
	deleteSessionCookie(event);
	redirect(303, '/login');
};
