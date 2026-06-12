<script lang="ts">
	import CategoryBadge from '$lib/components/CategoryBadge.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { formatCents } from '$lib/utils/money';
	import { formatDate, formatDateLong } from '$lib/utils/date';

	let { data } = $props();

	let visibleWidgets = $derived(data.prefs.widgets.filter((w) => w.visible).map((w) => w.id));
</script>

<div class="mb-6">
	<h1 class="text-2xl font-bold">Hallo, {data.user?.displayName}! 👋</h1>
	<p class="text-sm text-muted">
		{formatDateLong(data.today)}{data.tripDay ? ` · Tag ${data.tripDay} der Reise` : ''}
	</p>
</div>

{#each visibleWidgets as widget (widget)}
	{#if widget === 'kennzahlen'}
		<div class="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
			<div class="card p-4">
				<p class="text-xs text-muted">Gesamt-Kilometer</p>
				<p class="mt-1 text-xl font-bold">{data.totalKm.toLocaleString('de-DE')} km</p>
			</div>
			<div class="card p-4">
				<p class="text-xs text-muted">Ausgaben gesamt</p>
				<p class="mt-1 text-xl font-bold">{formatCents(data.totalExpenses)}</p>
			</div>
			<div class="card p-4">
				<p class="text-xs text-muted">Ausgaben heute</p>
				<p class="mt-1 text-xl font-bold">{formatCents(data.todayExpenses)}</p>
			</div>
			<div class="card p-4">
				<p class="text-xs text-muted">Tagebucheinträge</p>
				<p class="mt-1 text-xl font-bold">{data.diaryCount}</p>
			</div>
		</div>
	{:else if widget === 'tagebuch'}
		<section class="card mb-5 p-4">
			<header class="mb-2 flex items-center justify-between">
				<h2 class="font-semibold">Letzter Tagebucheintrag</h2>
				<a href="/tagebuch" class="text-sm text-accent">Alle ansehen</a>
			</header>
			{#if data.lastEntry}
				<a href="/tagebuch/{data.lastEntry.entry.date}" class="block rounded-xl bg-surface-2 p-3">
					<p class="text-sm font-semibold">
						{formatDateLong(data.lastEntry.entry.date)}
						{#if data.lastEntry.entry.distanceKm !== null}
							<span class="ml-1 font-normal text-muted">
								· {data.lastEntry.entry.distanceKm.toLocaleString('de-DE')} km
							</span>
						{/if}
					</p>
					{#if data.lastEntry.entry.title}
						<p class="text-sm">{data.lastEntry.entry.title}</p>
					{/if}
					{#if data.lastEntry.entry.text}
						<p class="mt-1 line-clamp-2 text-sm text-muted">{data.lastEntry.entry.text}</p>
					{/if}
				</a>
			{:else}
				<a href="/tagebuch/neu" class="btn-ghost w-full">
					<Icon name="plus" class="h-5 w-5" />
					Ersten Eintrag schreiben
				</a>
			{/if}
		</section>
	{:else if widget === 'ausgaben'}
		<section class="card mb-5 p-4">
			<header class="mb-2 flex items-center justify-between">
				<h2 class="font-semibold">Letzte Ausgaben</h2>
				<a href="/ausgaben" class="text-sm text-accent">Alle ansehen</a>
			</header>
			{#if data.recentExpenses.length === 0}
				<p class="py-3 text-center text-sm text-muted">Noch keine Ausgaben.</p>
			{:else}
				<ul class="divide-y divide-border">
					{#each data.recentExpenses as row (row.expense.id)}
						<li>
							<a href="/ausgaben/{row.expense.id}" class="flex items-center gap-3 py-2">
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-medium">
										{row.expense.description || row.cat?.name || 'Ausgabe'}
									</p>
									<p class="flex items-center gap-2 text-xs text-muted">
										<span>{formatDate(row.expense.date)}</span>
										{#if row.cat}
											<CategoryBadge name={row.cat.name} color={row.cat.color} icon={row.cat.icon} />
										{/if}
									</p>
								</div>
								<span class="text-sm font-semibold whitespace-nowrap">
									{formatCents(row.expense.amountCents)}
								</span>
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{:else if widget === 'essen'}
		<section class="card mb-5 p-4">
			<header class="mb-2 flex items-center justify-between">
				<h2 class="font-semibold">Essen zuletzt</h2>
				<a href="/essen" class="text-sm text-accent">Alle ansehen</a>
			</header>
			{#if data.recentFood.length === 0}
				<p class="py-3 text-center text-sm text-muted">Noch keine Einträge.</p>
			{:else}
				<ul class="divide-y divide-border">
					{#each data.recentFood as row (row.entry.id)}
						<li>
							<a href="/essen/{row.entry.id}" class="flex items-center gap-3 py-2">
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-medium">
										{row.entry.item}
										{#if row.entry.quantity}
											<span class="font-normal text-muted">· {row.entry.quantity}</span>
										{/if}
									</p>
									<p class="flex items-center gap-2 text-xs text-muted">
										<span>{formatDate(row.entry.date)}</span>
										{#if row.cat}
											<CategoryBadge name={row.cat.name} color={row.cat.color} icon={row.cat.icon} />
										{/if}
									</p>
								</div>
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{/if}
{/each}
