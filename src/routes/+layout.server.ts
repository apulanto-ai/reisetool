import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { userPrefs } from '$lib/server/db/schema';
import { getSetting } from '$lib/server/settings';
import { DEFAULT_PREFS, parsePrefs } from '$lib/utils/prefs';
import { eq } from 'drizzle-orm';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return { user: null, prefs: DEFAULT_PREFS, tripName: '' };
	}
	const prefsRow = await db
		.select()
		.from(userPrefs)
		.where(eq(userPrefs.userId, locals.user.id))
		.get();
	return {
		user: {
			id: locals.user.id,
			username: locals.user.username,
			displayName: locals.user.displayName,
			isAdmin: locals.user.isAdmin,
			theme: locals.user.theme,
			accentColor: locals.user.accentColor
		},
		prefs: parsePrefs(prefsRow?.prefs),
		tripName: (await getSetting('tripName')) ?? ''
	};
};
