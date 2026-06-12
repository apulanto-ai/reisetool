import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { diaryEntries, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { parseDiaryForm, previousOdometer, resolveDistance } from '$lib/server/diary';
import { getSetting } from '$lib/server/settings';

export const load: PageServerLoad = async ({ params }) => {
	const row = await db
		.select({ entry: diaryEntries, author: users.displayName })
		.from(diaryEntries)
		.leftJoin(users, eq(diaryEntries.userId, users.id))
		.where(eq(diaryEntries.date, params.date))
		.get();
	if (!row) error(404, 'Kein Eintrag für diesen Tag');

	return {
		entry: row.entry,
		author: row.author,
		prevOdometer: await previousOdometer(params.date),
		tripStartDate: await getSetting('tripStartDate')
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const existing = await db
			.select({ id: diaryEntries.id })
			.from(diaryEntries)
			.where(eq(diaryEntries.date, params.date))
			.get();
		if (!existing) error(404, 'Kein Eintrag für diesen Tag');

		const parsed = parseDiaryForm(await request.formData());
		if ('message' in parsed) return fail(400, { message: parsed.message });
		const { values } = parsed;

		if (values.date !== params.date) {
			const clash = await db
				.select({ id: diaryEntries.id })
				.from(diaryEntries)
				.where(eq(diaryEntries.date, values.date))
				.get();
			if (clash) return fail(400, { message: 'Für das neue Datum gibt es schon einen Eintrag.' });
		}

		const distanceKm = await resolveDistance(values);
		await db
			.update(diaryEntries)
			.set({ ...values, distanceKm, updatedAt: Date.now() })
			.where(eq(diaryEntries.id, existing.id));
		redirect(303, `/tagebuch/${values.date}`);
	},
	delete: async ({ params }) => {
		await db.delete(diaryEntries).where(eq(diaryEntries.date, params.date));
		redirect(303, '/tagebuch');
	}
};
