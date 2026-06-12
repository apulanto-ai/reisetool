// Beträge werden als Integer-Cents gespeichert; Eingabe/Anzeige im deutschen Format.

export function parseAmountToCents(input: string): number | null {
	const cleaned = input.trim().replace(/\s|€/g, '');
	if (!cleaned) return null;
	// "1.234,56" → "1234.56"; "12,5" → "12.5"; "12.50" bleibt gültig
	const normalized =
		cleaned.includes(',')
			? cleaned.replace(/\./g, '').replace(',', '.')
			: cleaned;
	const value = Number(normalized);
	if (!Number.isFinite(value) || value < 0) return null;
	return Math.round(value * 100);
}

export function formatCents(cents: number): string {
	return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(
		cents / 100
	);
}

// Für CSV-Export: Dezimalkomma ohne Währungszeichen
export function centsToDecimalComma(cents: number): string {
	return (cents / 100).toFixed(2).replace('.', ',');
}
