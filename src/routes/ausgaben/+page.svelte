<script lang="ts">
	import { enhance } from '$app/forms';
	import CategoryBadge from '$lib/components/CategoryBadge.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { formatCents } from '$lib/utils/money';
	import { formatDateLong } from '$lib/utils/date';

	let { data, form } = $props();

	let activeCats = $derived(data.cats.filter((c) => !c.disabled));
	let catById = $derived(new Map(data.cats.map((c) => [c.id, c])));

	let groups = $derived.by(() => {
		const map = new Map<string, typeof data.list>();
		for (const row of data.list) {
			const arr = map.get(row.expense.date) ?? [];
			arr.push(row);
			map.set(row.expense.date, arr);
		}
		return [...map.entries()].map(([date, rows]) => ({
			date,
			rows,
			sum: rows.reduce((s, r) => s + r.expense.amountCents, 0)
		}));
	});

	let compact = $derived(data.prefs.density === 'kompakt');
	let cardStyle = $derived(data.prefs.listStyle === 'karten');
</script>

<div class="mb-5 flex items-end justify-between">
	<div>
		<h1 class="text-2xl font-bold">Ausgaben</h1>
		<p class="text-sm text-muted">
			{data.rubrik ? 'Summe (gefiltert)' : 'Summe gesamt'}:
			<span class="font-semibold text-text">{formatCents(data.total)}</span>
		</p>
	</div>
</div>

<!-- Schnell-Eingabe -->
<form
	method="POST"
	action="?/create"
	use:enhance
	class="card mb-5 flex flex-col gap-3 p-4"
>
	<div class="grid grid-cols-2 gap-3">
		<div>
			<label class="label" for="amount">Betrag (€)</label>
			<input
				class="input"
				id="amount"
				name="amount"
				inputmode="decimal"
				placeholder="0,00"
				required
			/>
		</div>
		<div>
			<label class="label" for="categoryId">Rubrik</label>
			<select class="input" id="categoryId" name="categoryId" required>
				{#each activeCats as cat (cat.id)}
					<option value={cat.id}>{cat.icon} {cat.name}</option>
				{/each}
			</select>
		</div>
	</div>
	<div>
		<label class="label" for="description">Beschreibung</label>
		<input class="input" id="description" name="description" placeholder="z.B. Supermarkt" />
	</div>
	<div class="grid grid-cols-2 gap-3">
		<div>
			<label class="label" for="date">Datum</label>
			<input class="input" id="date" name="date" type="date" value={data.today} required />
		</div>
		<div>
			<label class="label" for="payerId">Bezahlt von</label>
			<select class="input" id="payerId" name="payerId">
				{#each data.members as m (m.id)}
					<option value={m.id} selected={m.id === data.user?.id}>{m.displayName}</option>
				{/each}
			</select>
		</div>
	</div>
	<details>
		<summary class="cursor-pointer text-sm text-muted">Notiz hinzufügen</summary>
		<textarea class="input mt-2" name="notes" rows="2" placeholder="Notiz …"></textarea>
	</details>

	{#if form?.message}
		<p class="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{form.message}</p>
	{/if}

	<button class="btn-primary" type="submit">
		<Icon name="plus" class="h-5 w-5" />
		Ausgabe eintragen
	</button>
</form>

<!-- Rubrik-Filter -->
<div class="mb-4 flex gap-2 overflow-x-auto pb-1">
	<a
		href="/ausgaben"
		class="rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap
			{!data.rubrik ? 'bg-accent text-accent-contrast' : 'bg-surface-2 text-muted'}"
	>
		Alle
	</a>
	{#each activeCats as cat (cat.id)}
		<a
			href="/ausgaben?rubrik={cat.id}"
			class="rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap
				{data.rubrik === cat.id ? 'bg-accent text-accent-contrast' : 'bg-surface-2 text-muted'}"
		>
			{cat.icon} {cat.name}
		</a>
	{/each}
</div>

<!-- Liste, nach Tag gruppiert -->
{#if groups.length === 0}
	<p class="py-10 text-center text-muted">Noch keine Ausgaben eingetragen.</p>
{/if}

{#each groups as group (group.date)}
	<section class="mb-4 {cardStyle ? 'card p-2' : ''}">
		<header class="flex items-baseline justify-between px-2 pt-2 pb-1">
			<h2 class="text-sm font-semibold text-muted">{formatDateLong(group.date)}</h2>
			<span class="text-sm font-semibold">{formatCents(group.sum)}</span>
		</header>
		<ul class="divide-y divide-border">
			{#each group.rows as row (row.expense.id)}
				{@const cat = row.expense.categoryId ? catById.get(row.expense.categoryId) : undefined}
				<li class="flex items-center gap-3 px-2 {compact ? 'py-1.5' : 'py-2.5'}">
					<a href="/ausgaben/{row.expense.id}" class="flex min-w-0 flex-1 items-center gap-3">
						<div class="min-w-0 flex-1">
							<p class="truncate font-medium">
								{row.expense.description || cat?.name || 'Ausgabe'}
							</p>
							<p class="flex items-center gap-2 text-xs text-muted">
								{#if cat}<CategoryBadge name={cat.name} color={cat.color} icon={cat.icon} />{/if}
								{#if row.payer}<span>{row.payer}</span>{/if}
							</p>
						</div>
						<span class="font-semibold whitespace-nowrap">
							{formatCents(row.expense.amountCents)}
						</span>
					</a>
				</li>
			{/each}
		</ul>
	</section>
{/each}
