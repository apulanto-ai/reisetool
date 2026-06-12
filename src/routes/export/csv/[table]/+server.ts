import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { categories, diaryEntries, expenses, foodLog, users } from '$lib/server/db/schema';
import { and, asc, eq, gte, lte, type Column, type SQL } from 'drizzle-orm';
import { csvResponse, toCsv } from '$lib/utils/csv';
import { centsToDecimalComma } from '$lib/utils/money';
import { todayISO } from '$lib/utils/date';

const km = (v: number | null) => (v === null ? '' : String(v).replace('.', ','));

function dateRange(url: URL, column: Column): SQL | undefined {
	const von = url.searchParams.get('von');
	const bis = url.searchParams.get('bis');
	const parts: SQL[] = [];
	if (von) parts.push(gte(column, von));
	if (bis) parts.push(lte(column, bis));
	return parts.length ? and(...parts) : undefined;
}

export const GET: RequestHandler = async ({ params, url }) => {
	const filename = `${params.table}-${todayISO()}.csv`;

	if (params.table === 'ausgaben') {
		const rows = await db
			.select({ e: expenses, cat: categories.name, payer: users.displayName })
			.from(expenses)
			.leftJoin(categories, eq(expenses.categoryId, categories.id))
			.leftJoin(users, eq(expenses.userId, users.id))
			.where(dateRange(url, expenses.date))
			.orderBy(asc(expenses.date), asc(expenses.createdAt));
		const csv = toCsv(
			['Datum', 'Betrag (EUR)', 'Rubrik', 'Beschreibung', 'Bezahlt von', 'Notiz'],
			rows.map((r) => [
				r.e.date,
				centsToDecimalComma(r.e.amountCents),
				r.cat ?? '',
				r.e.description,
				r.payer ?? '',
				r.e.notes
			])
		);
		return csvResponse(csv, filename);
	}

	if (params.table === 'essen') {
		const rows = await db
			.select({ e: foodLog, cat: categories.name, person: users.displayName })
			.from(foodLog)
			.leftJoin(categories, eq(foodLog.categoryId, categories.id))
			.leftJoin(users, eq(foodLog.userId, users.id))
			.where(dateRange(url, foodLog.date))
			.orderBy(asc(foodLog.date), asc(foodLog.createdAt));
		const csv = toCsv(
			['Datum', 'Was', 'Menge', 'Rubrik', 'Notiz', 'Erfasst von'],
			rows.map((r) => [r.e.date, r.e.item, r.e.quantity, r.cat ?? '', r.e.notes, r.person ?? ''])
		);
		return csvResponse(csv, filename);
	}

	if (params.table === 'tagebuch') {
		const rows = await db
			.select({ e: diaryEntries, author: users.displayName })
			.from(diaryEntries)
			.leftJoin(users, eq(diaryEntries.userId, users.id))
			.where(dateRange(url, diaryEntries.date))
			.orderBy(asc(diaryEntries.date));
		const csv = toCsv(
			[
				'Datum',
				'Titel',
				'Start',
				'Ziel',
				'Tachostand (km)',
				'Distanz (km)',
				'Geladen',
				'Wetter',
				'Vorkommnisse',
				'Text',
				'Autor'
			],
			rows.map((r) => [
				r.e.date,
				r.e.title,
				r.e.startLocation,
				r.e.endLocation,
				km(r.e.odometerKm),
				km(r.e.distanceKm),
				r.e.chargingInfo,
				r.e.weather,
				r.e.incidents,
				r.e.text,
				r.author ?? ''
			])
		);
		return csvResponse(csv, filename);
	}

	error(404, 'Unbekannter Export');
};
