import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { diaryEntries, users } from '$lib/server/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { getSetting } from '$lib/server/settings';

export const load: PageServerLoad = async () => {
	const list = await db
		.select({ entry: diaryEntries, author: users.displayName })
		.from(diaryEntries)
		.leftJoin(users, eq(diaryEntries.userId, users.id))
		.orderBy(desc(diaryEntries.date));

	const totals = await db
		.select({
			totalKm: sql<number>`coalesce(sum(${diaryEntries.distanceKm}), 0)`,
			count: sql<number>`count(*)`
		})
		.from(diaryEntries)
		.get();

	return {
		list,
		totalKm: totals?.totalKm ?? 0,
		count: totals?.count ?? 0,
		tripStartDate: await getSetting('tripStartDate')
	};
};
