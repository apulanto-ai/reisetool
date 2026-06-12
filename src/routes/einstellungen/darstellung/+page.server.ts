import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { userPrefs } from '$lib/server/db/schema';
import { parsePrefs } from '$lib/utils/prefs';

export const actions: Actions = {
	save: async ({ request, locals }) => {
		const form = await request.formData();
		const raw = String(form.get('prefs') ?? '');
		// parsePrefs normalisiert und verwirft Unbekanntes — kein kaputter Zustand möglich
		let prefs;
		try {
			prefs = parsePrefs(raw);
		} catch {
			return fail(400, { message: 'Ungültige Einstellungen.' });
		}
		const json = JSON.stringify(prefs);
		await db
			.insert(userPrefs)
			.values({ userId: locals.user!.id, prefs: json })
			.onConflictDoUpdate({ target: userPrefs.userId, set: { prefs: json } });
		return { success: true };
	}
};
