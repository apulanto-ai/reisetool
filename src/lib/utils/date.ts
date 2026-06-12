export function todayISO(): string {
	const now = new Date();
	const y = now.getFullYear();
	const m = String(now.getMonth() + 1).padStart(2, '0');
	const d = String(now.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export function formatDate(iso: string): string {
	const [y, m, d] = iso.split('-');
	return `${d}.${m}.${y}`;
}

const longFormat = new Intl.DateTimeFormat('de-DE', {
	weekday: 'short',
	day: 'numeric',
	month: 'long',
	year: 'numeric'
});

export function formatDateLong(iso: string): string {
	const date = new Date(`${iso}T12:00:00`);
	if (Number.isNaN(date.getTime())) return iso;
	return longFormat.format(date);
}

export function isValidISODate(value: string): boolean {
	return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00`).getTime());
}

// Reisetag-Nummer relativ zum Startdatum (1-basiert), null wenn vor dem Start
export function tripDayNumber(dateISO: string, tripStartISO: string | null): number | null {
	if (!tripStartISO) return null;
	const diff =
		(new Date(`${dateISO}T12:00:00`).getTime() - new Date(`${tripStartISO}T12:00:00`).getTime()) /
		86400000;
	const day = Math.round(diff) + 1;
	return day >= 1 ? day : null;
}
