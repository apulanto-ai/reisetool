// CSV im deutschen Excel-Format: Semikolon-Trenner, UTF-8 mit BOM

function escapeField(value: string): string {
	if (/[";\n\r]/.test(value)) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

export function toCsv(headers: string[], rows: string[][]): string {
	const lines = [headers, ...rows].map((row) => row.map(escapeField).join(';'));
	return '﻿' + lines.join('\r\n');
}

export function csvResponse(csv: string, filename: string): Response {
	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="${filename}"`
		}
	});
}
