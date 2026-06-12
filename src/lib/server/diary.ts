import { and, desc, isNotNull, lt } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { diaryEntries } from '$lib/server/db/schema';
import { isValidISODate } from '$lib/utils/date';

export function parseKm(input: string): number | null {
	const cleaned = input.trim().replace(',', '.');
	if (!cleaned) return null;
	const value = Number(cleaned);
	return Number.isFinite(value) && value >= 0 ? value : null;
}

export interface DiaryFormValues {
	date: string;
	title: string;
	startLocation: string;
	endLocation: string;
	odometerKm: number | null;
	distanceKm: number | null;
	chargingInfo: string;
	weather: string;
	incidents: string;
	text: string;
}

export function parseDiaryForm(form: FormData): { values: DiaryFormValues } | { message: string } {
	const date = String(form.get('date') ?? '');
	if (!isValidISODate(date)) return { message: 'Ungültiges Datum.' };

	const odometerRaw = String(form.get('odometerKm') ?? '').trim();
	const distanceRaw = String(form.get('distanceKm') ?? '').trim();
	const odometerKm = odometerRaw ? parseKm(odometerRaw) : null;
	const distanceKm = distanceRaw ? parseKm(distanceRaw) : null;
	if (odometerRaw && odometerKm === null) return { message: 'Ungültiger Tachostand.' };
	if (distanceRaw && distanceKm === null) return { message: 'Ungültige Tagesdistanz.' };

	return {
		values: {
			date,
			title: String(form.get('title') ?? '').trim(),
			startLocation: String(form.get('startLocation') ?? '').trim(),
			endLocation: String(form.get('endLocation') ?? '').trim(),
			odometerKm,
			distanceKm,
			chargingInfo: String(form.get('chargingInfo') ?? '').trim(),
			weather: String(form.get('weather') ?? '').trim(),
			incidents: String(form.get('incidents') ?? '').trim(),
			text: String(form.get('text') ?? '').trim()
		}
	};
}

// Letzter Tachostand vor dem angegebenen Datum — für Distanz-Vorbefüllung
export async function previousOdometer(beforeDate: string): Promise<number | null> {
	const row = await db
		.select({ odometerKm: diaryEntries.odometerKm, date: diaryEntries.date })
		.from(diaryEntries)
		.where(and(lt(diaryEntries.date, beforeDate), isNotNull(diaryEntries.odometerKm)))
		.orderBy(desc(diaryEntries.date))
		.limit(1)
		.get();
	return row?.odometerKm ?? null;
}

// Distanz aus Tacho-Differenz ableiten, wenn der Benutzer sie nicht selbst angibt
export async function resolveDistance(values: DiaryFormValues): Promise<number | null> {
	if (values.distanceKm !== null) return values.distanceKm;
	if (values.odometerKm === null) return null;
	const prev = await previousOdometer(values.date);
	if (prev === null || values.odometerKm < prev) return null;
	return Math.round((values.odometerKm - prev) * 10) / 10;
}
