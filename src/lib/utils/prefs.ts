// Anordnung & Darstellung pro Benutzer — als JSON in user_prefs gespeichert.

export const MODULE_IDS = ['start', 'ausgaben', 'essen', 'tagebuch'] as const;
export type ModuleId = (typeof MODULE_IDS)[number];

export const WIDGET_IDS = ['kennzahlen', 'tagebuch', 'ausgaben', 'essen'] as const;
export type WidgetId = (typeof WIDGET_IDS)[number];

export const WIDGET_LABELS: Record<WidgetId, string> = {
	kennzahlen: 'Kennzahlen (km, Ausgaben, Reisetag)',
	tagebuch: 'Letzter Tagebucheintrag',
	ausgaben: 'Letzte Ausgaben',
	essen: 'Letzte Essens-Einträge'
};

export const MODULE_LABELS: Record<ModuleId, string> = {
	start: 'Start',
	ausgaben: 'Ausgaben',
	essen: 'Essen',
	tagebuch: 'Tagebuch'
};

export interface Prefs {
	tabOrder: ModuleId[];
	widgets: Array<{ id: WidgetId; visible: boolean }>;
	listStyle: 'karten' | 'kompakt';
	density: 'komfortabel' | 'kompakt';
}

export const DEFAULT_PREFS: Prefs = {
	tabOrder: ['start', 'ausgaben', 'essen', 'tagebuch'],
	widgets: WIDGET_IDS.map((id) => ({ id, visible: true })),
	listStyle: 'karten',
	density: 'komfortabel'
};

// Robust gegen alte/unvollständige JSON-Stände: fehlende Teile aus Defaults ergänzen
export function parsePrefs(json: string | null | undefined): Prefs {
	let raw: Partial<Prefs> = {};
	try {
		raw = json ? JSON.parse(json) : {};
	} catch {
		raw = {};
	}
	const tabOrder = Array.isArray(raw.tabOrder)
		? (raw.tabOrder.filter((m): m is ModuleId => (MODULE_IDS as readonly string[]).includes(m)) as ModuleId[])
		: [];
	for (const m of MODULE_IDS) if (!tabOrder.includes(m)) tabOrder.push(m);

	const widgets = Array.isArray(raw.widgets)
		? raw.widgets.filter(
				(w): w is { id: WidgetId; visible: boolean } =>
					!!w && (WIDGET_IDS as readonly string[]).includes(w.id) && typeof w.visible === 'boolean'
			)
		: [];
	for (const id of WIDGET_IDS) if (!widgets.some((w) => w.id === id)) widgets.push({ id, visible: true });

	return {
		tabOrder,
		widgets,
		listStyle: raw.listStyle === 'kompakt' ? 'kompakt' : 'karten',
		density: raw.density === 'kompakt' ? 'kompakt' : 'komfortabel'
	};
}
