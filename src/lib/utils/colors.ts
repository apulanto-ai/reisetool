// Farbpalette für Rubriken — Schlüssel werden in der DB gespeichert,
// die Hex-Werte hier gerendert (keine dynamischen Tailwind-Klassen nötig)
export const CATEGORY_COLORS: Record<string, string> = {
	red: '#ef4444',
	orange: '#f97316',
	amber: '#d97706',
	green: '#10b981',
	teal: '#14b8a6',
	blue: '#3b82f6',
	violet: '#8b5cf6',
	pink: '#ec4899',
	gray: '#6b7280'
};

export const COLOR_LABELS: Record<string, string> = {
	red: 'Rot',
	orange: 'Orange',
	amber: 'Bernstein',
	green: 'Grün',
	teal: 'Türkis',
	blue: 'Blau',
	violet: 'Violett',
	pink: 'Pink',
	gray: 'Grau'
};

export function categoryColor(key: string): string {
	return CATEGORY_COLORS[key] ?? CATEGORY_COLORS.gray;
}
