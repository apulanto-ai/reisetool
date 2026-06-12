<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/Icon.svelte';

	let { data, form } = $props();

	const themes = [
		['system', 'System'],
		['light', 'Hell'],
		['dark', 'Dunkel']
	] as const;

	const accents = [
		['blue', 'Blau', '#2563eb'],
		['green', 'Grün', '#059669'],
		['orange', 'Orange', '#ea580c'],
		['violet', 'Violett', '#7c3aed'],
		['rose', 'Rosé', '#e11d48']
	] as const;
</script>

{#snippet feedback(section: string)}
	{#if form?.section === section}
		{#if form?.success}
			<p class="rounded-xl bg-ok/10 px-3 py-2 text-sm text-ok">Gespeichert ✓</p>
		{:else if form?.message}
			<p class="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{form.message}</p>
		{/if}
	{/if}
{/snippet}

<h1 class="mb-5 text-2xl font-bold">Einstellungen</h1>

<!-- Theme & Akzentfarbe -->
<form method="POST" action="?/appearance" use:enhance class="card mb-5 flex flex-col gap-4 p-4">
	<h2 class="font-semibold">Design</h2>

	<div>
		<p class="label">Theme</p>
		<div class="grid grid-cols-3 gap-2">
			{#each themes as [value, label] (value)}
				<label
					class="cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-medium
						{data.theme === value ? 'border-accent bg-accent-soft text-accent' : 'border-border bg-surface'}"
				>
					<input
						type="radio"
						name="theme"
						{value}
						checked={data.theme === value}
						class="sr-only"
					/>
					{label}
				</label>
			{/each}
		</div>
	</div>

	<div>
		<p class="label">Akzentfarbe</p>
		<div class="flex gap-3">
			{#each accents as [value, label, hex] (value)}
				<label class="cursor-pointer" title={label}>
					<input
						type="radio"
						name="accent"
						{value}
						checked={data.accentColor === value}
						class="peer sr-only"
					/>
					<span
						class="block h-9 w-9 rounded-full border-2 border-transparent transition peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-offset-surface"
						style="background: {hex}; --tw-ring-color: {hex}"
					></span>
				</label>
			{/each}
		</div>
	</div>

	{@render feedback('appearance')}
	<button class="btn-primary self-start" type="submit">Design speichern</button>
</form>

<!-- Anordnung & Darstellung -->
<a href="/einstellungen/darstellung" class="card mb-5 flex items-center gap-3 p-4 transition hover:border-accent">
	<Icon name="sliders" class="h-6 w-6 text-accent" />
	<div>
		<p class="font-medium">Anordnung & Darstellung</p>
		<p class="text-xs text-muted">Dashboard-Widgets, Tab-Reihenfolge, Listenansicht</p>
	</div>
</a>

<!-- Passwort -->
<form method="POST" action="?/password" use:enhance class="card mb-5 flex flex-col gap-3 p-4">
	<h2 class="font-semibold">Passwort ändern</h2>
	<div>
		<label class="label" for="current">Aktuelles Passwort</label>
		<input class="input" id="current" name="current" type="password" autocomplete="current-password" required />
	</div>
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
		<div>
			<label class="label" for="next">Neues Passwort</label>
			<input class="input" id="next" name="next" type="password" autocomplete="new-password" required />
		</div>
		<div>
			<label class="label" for="next2">Wiederholen</label>
			<input class="input" id="next2" name="next2" type="password" autocomplete="new-password" required />
		</div>
	</div>
	{@render feedback('password')}
	<button class="btn-primary self-start" type="submit">Passwort ändern</button>
</form>

<!-- Reisedaten (Admin) -->
{#if data.user?.isAdmin}
	<form method="POST" action="?/trip" use:enhance class="card flex flex-col gap-3 p-4">
		<h2 class="font-semibold">Reise (Admin)</h2>
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
			<div>
				<label class="label" for="tripName">Name der Reise</label>
				<input class="input" id="tripName" name="tripName" value={data.tripName} required />
			</div>
			<div>
				<label class="label" for="tripStartDate">Startdatum</label>
				<input class="input" id="tripStartDate" name="tripStartDate" type="date" value={data.tripStartDate} />
			</div>
		</div>
		{@render feedback('trip')}
		<button class="btn-primary self-start" type="submit">Speichern</button>
	</form>
{/if}
