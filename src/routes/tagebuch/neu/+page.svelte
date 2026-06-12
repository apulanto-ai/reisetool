<script lang="ts">
	import DiaryForm from '$lib/components/DiaryForm.svelte';

	let { data, form } = $props();
</script>

<div class="mb-5 flex items-center justify-between">
	<h1 class="text-2xl font-bold">Neuer Tagebucheintrag</h1>
	<a href="/tagebuch" class="text-sm text-muted hover:text-text">Zurück</a>
</div>

<DiaryForm
	action=""
	entry={{
		date: data.today,
		title: '',
		startLocation: '',
		endLocation: '',
		odometerKm: null,
		distanceKm: null,
		chargingInfo: '',
		weather: '',
		incidents: '',
		text: ''
	}}
	prevOdometer={data.prevOdometer}
	message={form?.message}
	submitLabel="Eintrag speichern"
/>
