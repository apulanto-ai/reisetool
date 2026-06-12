<script lang="ts">
	import { enhance } from '$app/forms';
	import DiaryForm from '$lib/components/DiaryForm.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { formatDateLong, tripDayNumber } from '$lib/utils/date';

	let { data, form } = $props();
	let editing = $state(false);

	$effect(() => {
		if (form?.message) editing = true;
	});

	let day = $derived(tripDayNumber(data.entry.date, data.tripStartDate));
</script>

<div class="mb-5 flex items-center justify-between gap-3">
	<div>
		<h1 class="text-xl font-bold">
			{formatDateLong(data.entry.date)}
			{#if day}<span class="ml-1 text-sm font-medium text-accent">Tag {day}</span>{/if}
		</h1>
		{#if data.author}<p class="text-sm text-muted">Eintrag von {data.author}</p>{/if}
	</div>
	<div class="flex shrink-0 gap-2">
		<a href="/tagebuch" class="btn-ghost px-3 py-2 text-sm">Zurück</a>
		<button class="btn-primary px-3 py-2 text-sm" onclick={() => (editing = !editing)}>
			<Icon name="pencil" class="h-4 w-4" />
			{editing ? 'Ansicht' : 'Bearbeiten'}
		</button>
	</div>
</div>

{#if editing}
	<DiaryForm
		action="?/update"
		entry={data.entry}
		prevOdometer={data.prevOdometer}
		message={form?.message}
		submitLabel="Änderungen speichern"
	/>

	<form
		method="POST"
		action="?/delete"
		use:enhance
		class="mt-4"
		onsubmit={(e) => {
			if (!confirm('Diesen Tagebucheintrag wirklich löschen?')) e.preventDefault();
		}}
	>
		<button class="btn-danger w-full" type="submit">
			<Icon name="trash" class="h-5 w-5" />
			Eintrag löschen
		</button>
	</form>
{:else}
	<article class="card p-5">
		{#if data.entry.title}
			<h2 class="mb-1 text-lg font-semibold">{data.entry.title}</h2>
		{/if}
		{#if data.entry.startLocation || data.entry.endLocation}
			<p class="mb-3 text-muted">
				{data.entry.startLocation}{data.entry.startLocation && data.entry.endLocation
					? ' → '
					: ''}{data.entry.endLocation}
			</p>
		{/if}

		<dl class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
			{#if data.entry.distanceKm !== null}
				<div class="rounded-xl bg-surface-2 p-3">
					<dt class="text-xs text-muted">Tagesdistanz</dt>
					<dd class="font-semibold">{data.entry.distanceKm.toLocaleString('de-DE')} km</dd>
				</div>
			{/if}
			{#if data.entry.odometerKm !== null}
				<div class="rounded-xl bg-surface-2 p-3">
					<dt class="text-xs text-muted">Tachostand</dt>
					<dd class="font-semibold">{data.entry.odometerKm.toLocaleString('de-DE')} km</dd>
				</div>
			{/if}
			{#if data.entry.weather}
				<div class="rounded-xl bg-surface-2 p-3">
					<dt class="text-xs text-muted">Wetter</dt>
					<dd class="font-semibold">{data.entry.weather}</dd>
				</div>
			{/if}
			{#if data.entry.chargingInfo}
				<div class="rounded-xl bg-surface-2 p-3">
					<dt class="flex items-center gap-1 text-xs text-muted">
						<Icon name="bolt" class="h-3.5 w-3.5" />
						Geladen
					</dt>
					<dd class="font-semibold">{data.entry.chargingInfo}</dd>
				</div>
			{/if}
		</dl>

		{#if data.entry.text}
			<p class="whitespace-pre-wrap">{data.entry.text}</p>
		{/if}
		{#if data.entry.incidents}
			<div class="mt-4 rounded-xl border border-danger/30 bg-danger/5 p-3">
				<p class="mb-1 text-xs font-semibold text-danger">Vorkommnisse</p>
				<p class="text-sm whitespace-pre-wrap">{data.entry.incidents}</p>
			</div>
		{/if}
	</article>
{/if}
