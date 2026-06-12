import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { categories, diaryEntries, expenses, foodLog, users } from '$lib/server/db/schema';
import { getAllSettings } from '$lib/server/settings';
import { todayISO } from '$lib/utils/date';

export const GET: RequestHandler = async () => {
	const dump = {
		exportedAt: new Date().toISOString(),
		settings: await getAllSettings(),
		users: (await db.select().from(users)).map(({ passwordHash: _ph, ...rest }) => rest),
		categories: await db.select().from(categories),
		expenses: await db.select().from(expenses),
		foodLog: await db.select().from(foodLog),
		diaryEntries: await db.select().from(diaryEntries)
	};

	return new Response(JSON.stringify(dump, null, 2), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Content-Disposition': `attachment; filename="reisetool-export-${todayISO()}.json"`
		}
	});
};
