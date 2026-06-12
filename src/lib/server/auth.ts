import { createHash, randomBytes } from 'node:crypto';
import { hash, verify } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { sessions, users, type User } from '$lib/server/db/schema';

const DAY_MS = 24 * 60 * 60 * 1000;
const SESSION_LIFETIME = 30 * DAY_MS;
const RENEWAL_THRESHOLD = 15 * DAY_MS;

export const SESSION_COOKIE = 'session';

export function hashPassword(password: string): Promise<string> {
	return hash(password); // Argon2id mit Default-Parametern
}

export function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
	return verify(passwordHash, password);
}

function sessionIdFromToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: number }> {
	const token = randomBytes(32).toString('base64url');
	const expiresAt = Date.now() + SESSION_LIFETIME;
	await db.insert(sessions).values({ id: sessionIdFromToken(token), userId, expiresAt });
	return { token, expiresAt };
}

export async function validateSessionToken(
	token: string
): Promise<{ user: User; sessionId: string; expiresAt: number } | null> {
	const sessionId = sessionIdFromToken(token);
	const result = await db
		.select({ session: sessions, user: users })
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, sessionId))
		.get();
	if (!result) return null;

	const { session, user } = result;
	if (Date.now() >= session.expiresAt || user.disabled) {
		await db.delete(sessions).where(eq(sessions.id, sessionId));
		return null;
	}

	let expiresAt = session.expiresAt;
	if (session.expiresAt - Date.now() < RENEWAL_THRESHOLD) {
		expiresAt = Date.now() + SESSION_LIFETIME;
		await db.update(sessions).set({ expiresAt }).where(eq(sessions.id, sessionId));
	}
	return { user, sessionId, expiresAt };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function invalidateUserSessions(userId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.userId, userId));
}

// secure-Flag aus der tatsächlichen URL ableiten — Zugriff via Tailscale kann plain http sein
export function setSessionCookie(event: RequestEvent, token: string, expiresAt: number): void {
	event.cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: event.url.protocol === 'https:',
		expires: new Date(expiresAt)
	});
}

export function deleteSessionCookie(event: RequestEvent): void {
	event.cookies.delete(SESSION_COOKIE, { path: '/' });
}

// Theme/Akzent zusätzlich als Cookie, damit SSR vor dem Login bzw. direkt nach
// Theme-Wechsel ohne Flackern rendert (hooks.server.ts liest sie als Fallback)
export function setThemeCookies(event: RequestEvent, theme: string, accent: string): void {
	const opts = {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: event.url.protocol === 'https:',
		maxAge: 365 * 24 * 60 * 60
	} as const;
	event.cookies.set('theme', theme, opts);
	event.cookies.set('accent', accent, opts);
}
