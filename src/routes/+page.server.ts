import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { categories, diaryEntries, expenses, foodLog, users } from '$lib/server/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { getSetting } from '$lib/server/settings';
import { todayISO, tripDayNumber } from '$lib/utils/date';

export const load: PageServerLoad = async () => {
	const today = todayISO();

	const diaryTotals = await db
		.select({
			totalKm: sql<number>`coalesce(sum(${diaryEntries.distanceKm}), 0)`,
			count: sql<number>`count(*)`
		})
		.from(diaryEntries)
		.get();

	const expenseTotal = await db
		.select({ total: sql<number>`coalesce(sum(${expenses.amountCents}), 0)` })
		.from(expenses)
		.get();

	const expenseToday = await db
		.select({ total: sql<number>`coalesce(sum(${expenses.amountCents}), 0)` })
		.from(expenses)
		.where(eq(expenses.date, today))
		.get();

	const lastEntry = await db
		.select({ entry: diaryEntries, author: users.displayName })
		.from(diaryEntries)
		.leftJoin(users, eq(diaryEntries.userId, users.id))
		.orderBy(desc(diaryEntries.date))
		.limit(1)
		.get();

	const recentExpenses = await db
		.select({ expense: expenses, cat: categories })
		.from(expenses)
		.leftJoin(categories, eq(expenses.categoryId, categories.id))
		.orderBy(desc(expenses.date), desc(expenses.createdAt))
		.limit(5);

	const recentFood = await db
		.select({ entry: foodLog, cat: categories })
		.from(foodLog)
		.leftJoin(categories, eq(foodLog.categoryId, categories.id))
		.orderBy(desc(foodLog.date), desc(foodLog.createdAt))
		.limit(5);

	const tripStartDate = await getSetting('tripStartDate');

	return {
		totalKm: diaryTotals?.totalKm ?? 0,
		diaryCount: diaryTotals?.count ?? 0,
		totalExpenses: expenseTotal?.total ?? 0,
		todayExpenses: expenseToday?.total ?? 0,
		tripDay: tripDayNumber(today, tripStartDate),
		lastEntry: lastEntry ?? null,
		recentExpenses,
		recentFood,
		today
	};
};
