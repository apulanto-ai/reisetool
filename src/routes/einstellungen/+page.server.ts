import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, setThemeCookies, verifyPassword } from '$lib/server/auth';
import { getSetting, setSetting } from '$lib/server/settings';
import { isValidISODate } from '$lib/utils/date';

const THEMES = ['system', 'light', 'dark'];
const ACCENTS = ['blue', 'green', 'orange', 'violet', 'rose'];

export const load: PageServerLoad = async ({ locals }) => {
	return {
		tripName: (await getSetting('tripName')) ?? '',
		tripStartDate: (await getSetting('tripStartDate')) ?? '',
		theme: locals.user!.theme,
		accentColor: locals.user!.accentColor
	};
};

export const actions: Actions = {
	appearance: async (event) => {
		const form = await event.request.formData();
		const theme = String(form.get('theme') ?? '');
		const accent = String(form.get('accent') ?? '');
		if (!THEMES.includes(theme) || !ACCENTS.includes(accent)) {
			return fail(400, { section: 'appearance', message: 'Ungültige Auswahl.' });
		}
		await db
			.update(users)
			.set({ theme, accentColor: accent })
			.where(eq(users.id, event.locals.user!.id));
		setThemeCookies(event, theme, accent);
		return { section: 'appearance', success: true };
	},

	password: async ({ request, locals }) => {
		const form = await request.formData();
		const current = String(form.get('current') ?? '');
		const next = String(form.get('next') ?? '');
		const next2 = String(form.get('next2') ?? '');

		if (!(await verifyPassword(locals.user!.passwordHash, current))) {
			return fail(400, { section: 'password', message: 'Das aktuelle Passwort ist falsch.' });
		}
		if (next.length < 8) {
			return fail(400, {
				section: 'password',
				message: 'Das neue Passwort braucht mindestens 8 Zeichen.'
			});
		}
		if (next !== next2) {
			return fail(400, { section: 'password', message: 'Die Passwörter stimmen nicht überein.' });
		}
		await db
			.update(users)
			.set({ passwordHash: await hashPassword(next) })
			.where(eq(users.id, locals.user!.id));
		return { section: 'password', success: true };
	},

	trip: async ({ request, locals }) => {
		if (!locals.user!.isAdmin) return fail(403, { section: 'trip', message: 'Nur für Admins.' });
		const form = await request.formData();
		const tripName = String(form.get('tripName') ?? '').trim();
		const tripStartDate = String(form.get('tripStartDate') ?? '').trim();
		if (!tripName) return fail(400, { section: 'trip', message: 'Bitte gib einen Namen ein.' });
		if (tripStartDate && !isValidISODate(tripStartDate)) {
			return fail(400, { section: 'trip', message: 'Ungültiges Startdatum.' });
		}
		await setSetting('tripName', tripName);
		await setSetting('tripStartDate', tripStartDate);
		return { section: 'trip', success: true };
	}
};
