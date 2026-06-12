import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const id = () =>
	text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID());

export const users = sqliteTable('users', {
	id: id(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	displayName: text('display_name').notNull(),
	isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
	disabled: integer('disabled', { mode: 'boolean' }).notNull().default(false),
	theme: text('theme').notNull().default('system'),
	accentColor: text('accent_color').notNull().default('blue'),
	createdAt: integer('created_at')
		.notNull()
		.$defaultFn(() => Date.now())
});

export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at').notNull()
});

// Rubriken für Ausgaben und Essen — frei konfigurierbar im Admin-Bereich
export const categories = sqliteTable('categories', {
	id: id(),
	scope: text('scope').notNull(), // 'ausgaben' | 'essen'
	name: text('name').notNull(),
	color: text('color').notNull().default('gray'),
	icon: text('icon').notNull().default(''),
	sortOrder: integer('sort_order').notNull().default(0),
	disabled: integer('disabled', { mode: 'boolean' }).notNull().default(false)
});

export const expenses = sqliteTable(
	'expenses',
	{
		id: id(),
		userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
		date: text('date').notNull(), // YYYY-MM-DD
		amountCents: integer('amount_cents').notNull(),
		categoryId: text('category_id').references(() => categories.id),
		description: text('description').notNull().default(''),
		notes: text('notes').notNull().default(''),
		createdAt: integer('created_at')
			.notNull()
			.$defaultFn(() => Date.now())
	},
	(t) => [index('expenses_date_idx').on(t.date), index('expenses_category_idx').on(t.categoryId)]
);

export const foodLog = sqliteTable(
	'food_log',
	{
		id: id(),
		userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
		date: text('date').notNull(),
		item: text('item').notNull(),
		quantity: text('quantity').notNull().default(''), // Freitext: "500 g", "2 Stück"
		categoryId: text('category_id').references(() => categories.id),
		notes: text('notes').notNull().default(''),
		createdAt: integer('created_at')
			.notNull()
			.$defaultFn(() => Date.now())
	},
	(t) => [index('food_log_date_idx').on(t.date)]
);

export const diaryEntries = sqliteTable('diary_entries', {
	id: id(),
	userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
	date: text('date').notNull().unique(), // ein Eintrag pro Tag
	title: text('title').notNull().default(''),
	startLocation: text('start_location').notNull().default(''),
	endLocation: text('end_location').notNull().default(''),
	odometerKm: real('odometer_km'), // Tachostand am Tagesende
	distanceKm: real('distance_km'), // Tagesdistanz (vorbefüllt, überschreibbar)
	chargingInfo: text('charging_info').notNull().default(''), // wo/wie geladen (E-Bike)
	weather: text('weather').notNull().default(''),
	incidents: text('incidents').notNull().default(''),
	text: text('text').notNull().default(''),
	createdAt: integer('created_at')
		.notNull()
		.$defaultFn(() => Date.now()),
	updatedAt: integer('updated_at')
		.notNull()
		.$defaultFn(() => Date.now())
});

export const userPrefs = sqliteTable('user_prefs', {
	userId: text('user_id')
		.primaryKey()
		.references(() => users.id, { onDelete: 'cascade' }),
	prefs: text('prefs').notNull().default('{}')
});

export const settings = sqliteTable('settings', {
	key: text('key').primaryKey(),
	value: text('value').notNull()
});

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type FoodLogEntry = typeof foodLog.$inferSelect;
export type DiaryEntry = typeof diaryEntries.$inferSelect;
