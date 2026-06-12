<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { formatCents } from '$lib/utils/money';
	import { formatDateLong, tripDayNumber } from '$lib/utils/date';

	let { data } = $props();
</script>

<div class="mb-5 flex items-center justify-between print:hidden">
	<a href="/export" class="text-sm text-muted hover:text-text">Zurück</a>
	<button class="btn-primary" onclick={() => window.print()}>
		Drucken / Als PDF speichern
	</button>
</div>

<article class="report">
	<header class="mb-8 text-center">
		<h1 class="text-3xl font-bold">🚲 {data.tripName}</h1>
		<p class="mt-2 text-muted">
			Reisebericht · {data.entries.length} Tage ·
			{data.totalKm.toLocaleString('de-DE')} km ·
			{formatCents(data.totalExpenses)}
		</p>
	</header>

	<!-- Ausgaben-Zusammenfassung -->
	<section class="mb-8">
		<h2 class="mb-3 text-xl font-bold">Ausgaben</h2>
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
			<div>
				<h3 class="mb-2 text-sm font-semibold text-muted">Nach Rubrik</h3>
				<table class="w-full text-sm">
					<tbody>
						{#each data.byCategory as row (row.name)}
							<tr class="border-b border-border">
								<td class="py-1.5">{row.icon} {row.name}</td>
								<td class="py-1.5 text-right font-medium">{formatCents(row.total)}</td>
							</tr>
						{/each}
						<tr>
							<td class="py-1.5 font-bold">Gesamt</td>
							<td class="py-1.5 text-right font-bold">{formatCents(data.totalExpenses)}</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div>
				<h3 class="mb-2 text-sm font-semibold text-muted">Nach Person</h3>
				<table class="w-full text-sm">
					<tbody>
						{#each data.byPayer as row (row.name)}
							<tr class="border-b border-border">
								<td class="py-1.5">{row.name}</td>
								<td class="py-1.5 text-right font-medium">{formatCents(row.total)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>

	<!-- Tagebuch -->
	<section>
		<h2 class="mb-3 text-xl font-bold">Reisetagebuch</h2>
		{#if data.entries.length === 0}
			<p class="text-muted">Noch keine Einträge.</p>
		{/if}
		{#each data.entries as row (row.entry.id)}
			{@const day = tripDayNumber(row.entry.date, data.tripStartDate)}
			<section class="day mb-6 border-t border-border pt-4">
				<header class="mb-1 flex items-baseline justify-between gap-3">
					<h3 class="font-bold">
						{formatDateLong(row.entry.date)}
						{#if day}<span class="ml-1 text-sm font-medium text-accent">Tag {day}</span>{/if}
					</h3>
					{#if row.entry.distanceKm !== null}
						<span class="shrink-0 text-sm font-semibold">
							{row.entry.distanceKm.toLocaleString('de-DE')} km
						</span>
					{/if}
				</header>
				{#if row.entry.title}<p class="font-medium">{row.entry.title}</p>{/if}
				{#if row.entry.startLocation || row.entry.endLocation}
					<p class="text-sm text-muted">
						{row.entry.startLocation}{row.entry.startLocation && row.entry.endLocation
							? ' → '
							: ''}{row.entry.endLocation}
					</p>
				{/if}
				<p class="mt-1 flex flex-wrap gap-x-4 text-sm text-muted">
					{#if row.entry.odometerKm !== null}
						<span>Tacho: {row.entry.odometerKm.toLocaleString('de-DE')} km</span>
					{/if}
					{#if row.entry.weather}<span>Wetter: {row.entry.weather}</span>{/if}
					{#if row.entry.chargingInfo}
						<span class="inline-flex items-center gap-1">
							<Icon name="bolt" class="h-3.5 w-3.5" />
							{row.entry.chargingInfo}
						</span>
					{/if}
					{#if row.author}<span>von {row.author}</span>{/if}
				</p>
				{#if row.entry.text}
					<p class="mt-2 text-sm whitespace-pre-wrap">{row.entry.text}</p>
				{/if}
				{#if row.entry.incidents}
					<p class="mt-2 text-sm whitespace-pre-wrap">
						<strong>Vorkommnisse:</strong>
						{row.entry.incidents}
					</p>
				{/if}
			</section>
		{/each}
	</section>
</article>

<style>
	@media print {
		.day {
			break-inside: avoid;
		}
	}
</style>
