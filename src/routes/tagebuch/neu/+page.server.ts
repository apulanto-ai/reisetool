import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { diaryEntries } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { parseDiaryForm, previousOdometer, resolveDistance } from '$lib/server/diary';
import { todayISO } from '$lib/utils/date';

export const load: PageServerLoad = async () => {
	return {
		today: todayISO(),
		prevOdometer: await previousOdometer('9999-12-31')
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const parsed = parseDiaryForm(await request.formData());
		if ('message' in parsed) return fail(400, { message: parsed.message });
		const { values } = parsed;

		const existing = await db
			.select({ id: diaryEntries.id })
			.from(diaryEntries)
			.where(eq(diaryEntries.date, values.date))
			.get();
		if (existing) {
			return fail(400, {
				message: `Für diesen Tag gibt es schon einen Eintrag — öffne ihn unter Tagebuch und bearbeite ihn dort.`
			});
		}

		const distanceKm = await resolveDistance(values);
		await db.insert(diaryEntries).values({ ...values, distanceKm, userId: locals.user!.id });
		redirect(303, `/tagebuch/${values.date}`);
	}
};
