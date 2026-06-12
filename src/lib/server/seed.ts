import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';

// Standard-Rubriken beim First-Run-Setup; danach frei änderbar unter /admin/rubriken
const DEFAULT_CATEGORIES: Array<{
	scope: 'ausgaben' | 'essen';
	name: string;
	color: string;
	icon: string;
}> = [
	{ scope: 'ausgaben', name: 'Essen & Trinken', color: 'amber', icon: '🍽️' },
	{ scope: 'ausgaben', name: 'Unterkunft', color: 'blue', icon: '🏠' },
	{ scope: 'ausgaben', name: 'Reparatur', color: 'red', icon: '🔧' },
	{ scope: 'ausgaben', name: 'Transport', color: 'violet', icon: '🚆' },
	{ scope: 'ausgaben', name: 'Laden (E-Bike)', color: 'green', icon: '🔌' },
	{ scope: 'ausgaben', name: 'Sonstiges', color: 'gray', icon: '📦' },
	{ scope: 'essen', name: 'Einkauf', color: 'green', icon: '🛒' },
	{ scope: 'essen', name: 'Verbrauch', color: 'amber', icon: '🍽️' }
];

export async function seedDefaultCategories(): Promise<void> {
	await db
		.insert(categories)
		.values(DEFAULT_CATEGORIES.map((c, i) => ({ ...c, sortOrder: i })));
}
