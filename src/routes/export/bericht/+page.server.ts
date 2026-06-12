import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { categories, diaryEntries, expenses, users } from '$lib/server/db/schema';
import { asc, eq, sql } from 'drizzle-orm';
import { getSetting } from '$lib/server/settings';

export const load: PageServerLoad = async () => {
	const entries = await db
		.select({ entry: diaryEntries, author: users.displayName })
		.from(diaryEntries)
		.leftJoin(users, eq(diaryEntries.userId, users.id))
		.orderBy(asc(diaryEntries.date));

	const byCategory = await db
		.select({
			name: sql<string>`coalesce(${categories.name}, 'Ohne Rubrik')`,
			icon: sql<string>`coalesce(${categories.icon}, '')`,
			total: sql<number>`sum(${expenses.amountCents})`
		})
		.from(expenses)
		.leftJoin(categories, eq(expenses.categoryId, categories.id))
		.groupBy(categories.id)
		.orderBy(sql`sum(${expenses.amountCents}) desc`);

	const byPayer = await db
		.select({
			name: sql<string>`coalesce(${users.displayName}, 'Unbekannt')`,
			total: sql<number>`sum(${expenses.amountCents})`
		})
		.from(expenses)
		.leftJoin(users, eq(expenses.userId, users.id))
		.groupBy(users.id)
		.orderBy(sql`sum(${expenses.amountCents}) desc`);

	const totals = await db
		.select({
			expenses: sql<number>`coalesce(sum(${expenses.amountCents}), 0)`
		})
		.from(expenses)
		.get();

	const kmTotal = await db
		.select({ km: sql<number>`coalesce(sum(${diaryEntries.distanceKm}), 0)` })
		.from(diaryEntries)
		.get();

	return {
		entries,
		byCategory,
		byPayer,
		totalExpenses: totals?.expenses ?? 0,
		totalKm: kmTotal?.km ?? 0,
		tripName: (await getSetting('tripName')) ?? 'Reisetool',
		tripStartDate: await getSetting('tripStartDate')
	};
};
