<script lang="ts">
	import { enhance } from '$app/forms';

	interface EntryValues {
		date: string;
		title: string;
		startLocation: string;
		endLocation: string;
		odometerKm: number | null;
		distanceKm: number | null;
		chargingInfo: string;
		weather: string;
		incidents: string;
		text: string;
	}

	let {
		action,
		entry,
		prevOdometer = null,
		message = null,
		submitLabel,
		dateReadonly = false
	}: {
		action: string;
		entry: EntryValues;
		prevOdometer?: number | null;
		message?: string | null;
		submitLabel: string;
		dateReadonly?: boolean;
	} = $props();

	const km = (v: number | null) => (v === null ? '' : String(v).replace('.', ','));
</script>

<form method="POST" {action} use:enhance class="card flex flex-col gap-3 p-4">
	<div class="grid grid-cols-2 gap-3">
		<div>
			<label class="label" for="date">Datum</label>
			<input
				class="input"
				id="date"
				name="date"
				type="date"
				value={entry.date}
				readonly={dateReadonly}
				required
			/>
		</div>
		<div>
			<label class="label" for="title">Titel</label>
			<input class="input" id="title" name="title" placeholder="z.B. Bergetappe!" value={entry.title} />
		</div>
	</div>

	<div class="grid grid-cols-2 gap-3">
		<div>
			<label class="label" for="startLocation">Start</label>
			<input class="input" id="startLocation" name="startLocation" value={entry.startLocation} />
		</div>
		<div>
			<label class="label" for="endLocation">Ziel</label>
			<input class="input" id="endLocation" name="endLocation" value={entry.endLocation} />
		</div>
	</div>

	<div class="grid grid-cols-2 gap-3">
		<div>
			<label class="label" for="odometerKm">Tachostand (km)</label>
			<input
				class="input"
				id="odometerKm"
				name="odometerKm"
				inputmode="decimal"
				placeholder={prevOdometer !== null ? `zuletzt ${km(prevOdometer)}` : 'z.B. 1234,5'}
				value={km(entry.odometerKm)}
			/>
		</div>
		<div>
			<label class="label" for="distanceKm">Tagesdistanz (km)</label>
			<input
				class="input"
				id="distanceKm"
				name="distanceKm"
				inputmode="decimal"
				placeholder="automatisch"
				value={km(entry.distanceKm)}
			/>
			<p class="mt-1 text-xs text-muted">Leer lassen = aus Tacho-Differenz berechnet</p>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-3">
		<div>
			<label class="label" for="chargingInfo">Geladen (E-Bike)</label>
			<input
				class="input"
				id="chargingInfo"
				name="chargingInfo"
				placeholder="wo / wie geladen"
				value={entry.chargingInfo}
			/>
		</div>
		<div>
			<label class="label" for="weather">Wetter</label>
			<input class="input" id="weather" name="weather" placeholder="z.B. sonnig, 24 °C" value={entry.weather} />
		</div>
	</div>

	<div>
		<label class="label" for="text">Erinnerungen</label>
		<textarea class="input" id="text" name="text" rows="5" placeholder="Wie war der Tag?">{entry.text}</textarea>
	</div>

	<div>
		<label class="label" for="incidents">Vorkommnisse</label>
		<textarea class="input" id="incidents" name="incidents" rows="2" placeholder="Pannen, Besonderheiten …">{entry.incidents}</textarea>
	</div>

	{#if message}
		<p class="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{message}</p>
	{/if}

	<button class="btn-primary" type="submit">{submitLabel}</button>
</form>
