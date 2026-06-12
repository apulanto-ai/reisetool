<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { formatDateLong, tripDayNumber } from '$lib/utils/date';

	let { data } = $props();
</script>

<div class="mb-5 flex items-end justify-between gap-3">
	<div>
		<h1 class="text-2xl font-bold">Reisetagebuch</h1>
		<p class="text-sm text-muted">
			{data.count} Einträge ·
			<span class="font-semibold text-text">{data.totalKm.toLocaleString('de-DE')} km</span> gesamt
		</p>
	</div>
	<a href="/tagebuch/neu" class="btn-primary shrink-0">
		<Icon name="plus" class="h-5 w-5" />
		Neuer Eintrag
	</a>
</div>

{#if data.list.length === 0}
	<p class="py-10 text-center text-muted">
		Noch keine Einträge — leg mit dem ersten Reisetag los! 🚴
	</p>
{/if}

<div class="flex flex-col gap-4">
	{#each data.list as row (row.entry.id)}
		{@const day = tripDayNumber(row.entry.date, data.tripStartDate)}
		<a href="/tagebuch/{row.entry.date}" class="card block p-4 transition hover:border-accent">
			<header class="mb-1 flex items-baseline justify-between gap-2">
				<h2 class="font-semibold">
					{formatDateLong(row.entry.date)}
					{#if day}<span class="ml-1 text-xs font-medium text-accent">Tag {day}</span>{/if}
				</h2>
				{#if row.entry.distanceKm !== null}
					<span class="shrink-0 text-sm font-semibold">
						{row.entry.distanceKm.toLocaleString('de-DE')} km
					</span>
				{/if}
			</header>
			{#if row.entry.title}
				<p class="font-medium">{row.entry.title}</p>
			{/if}
			{#if row.entry.startLocation || row.entry.endLocation}
				<p class="text-sm text-muted">
					{row.entry.startLocation}{row.entry.startLocation && row.entry.endLocation ? ' → ' : ''}{row
						.entry.endLocation}
				</p>
			{/if}
			<div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
				{#if row.entry.weather}<span>{row.entry.weather}</span>{/if}
				{#if row.entry.chargingInfo}
					<span class="inline-flex items-center gap-1">
						<Icon name="bolt" class="h-3.5 w-3.5" />
						{row.entry.chargingInfo}
					</span>
				{/if}
				{#if row.author}<span>von {row.author}</span>{/if}
			</div>
			{#if row.entry.text}
				<p class="mt-2 line-clamp-2 text-sm text-muted">{row.entry.text}</p>
			{/if}
		</a>
	{/each}
</div>
