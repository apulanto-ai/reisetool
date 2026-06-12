<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/Icon.svelte';
	import { MODULE_LABELS, WIDGET_LABELS } from '$lib/utils/prefs';

	let { data, form } = $props();

	// Lokaler Bearbeitungszustand — übernimmt bewusst nur den Initialwert
	/* svelte-ignore state_referenced_locally */
	let widgets = $state(data.prefs.widgets.map((w) => ({ ...w })));
	/* svelte-ignore state_referenced_locally */
	let tabOrder = $state([...data.prefs.tabOrder]);
	/* svelte-ignore state_referenced_locally */
	let listStyle = $state(data.prefs.listStyle);
	/* svelte-ignore state_referenced_locally */
	let density = $state(data.prefs.density);

	function move<T>(arr: T[], index: number, dir: -1 | 1) {
		const target = index + dir;
		if (target < 0 || target >= arr.length) return;
		[arr[index], arr[target]] = [arr[target], arr[index]];
	}

	let json = $derived(JSON.stringify({ widgets, tabOrder, listStyle, density }));
</script>

<div class="mb-5 flex items-center justify-between">
	<h1 class="text-2xl font-bold">Anordnung & Darstellung</h1>
	<a href="/einstellungen" class="text-sm text-muted hover:text-text">Zurück</a>
</div>

<form method="POST" action="?/save" use:enhance class="flex flex-col gap-5">
	<input type="hidden" name="prefs" value={json} />

	<!-- Dashboard-Widgets -->
	<section class="card p-4">
		<h2 class="mb-1 font-semibold">Dashboard-Widgets</h2>
		<p class="mb-3 text-xs text-muted">Reihenfolge ändern und Widgets ein-/ausblenden</p>
		<ul class="divide-y divide-border">
			{#each widgets as widget, i (widget.id)}
				<li class="flex items-center gap-2 py-2">
					<label class="flex min-w-0 flex-1 items-center gap-3">
						<input type="checkbox" bind:checked={widget.visible} class="h-5 w-5 accent-[var(--accent)]" />
						<span class="truncate text-sm font-medium {widget.visible ? '' : 'text-muted line-through'}">
							{WIDGET_LABELS[widget.id]}
						</span>
					</label>
					<button type="button" class="btn-ghost p-2" disabled={i === 0} onclick={() => move(widgets, i, -1)} aria-label="Nach oben">
						<Icon name="chevronUp" class="h-4 w-4" />
					</button>
					<button type="button" class="btn-ghost p-2" disabled={i === widgets.length - 1} onclick={() => move(widgets, i, 1)} aria-label="Nach unten">
						<Icon name="chevronDown" class="h-4 w-4" />
					</button>
				</li>
			{/each}
		</ul>
	</section>

	<!-- Tab-Reihenfolge -->
	<section class="card p-4">
		<h2 class="mb-1 font-semibold">Tab-Reihenfolge</h2>
		<p class="mb-3 text-xs text-muted">Reihenfolge der Navigation (mobil & Desktop)</p>
		<ul class="divide-y divide-border">
			{#each tabOrder as moduleId, i (moduleId)}
				<li class="flex items-center gap-2 py-2">
					<span class="min-w-0 flex-1 truncate text-sm font-medium">{MODULE_LABELS[moduleId]}</span>
					<button type="button" class="btn-ghost p-2" disabled={i === 0} onclick={() => move(tabOrder, i, -1)} aria-label="Nach oben">
						<Icon name="chevronUp" class="h-4 w-4" />
					</button>
					<button type="button" class="btn-ghost p-2" disabled={i === tabOrder.length - 1} onclick={() => move(tabOrder, i, 1)} aria-label="Nach unten">
						<Icon name="chevronDown" class="h-4 w-4" />
					</button>
				</li>
			{/each}
		</ul>
	</section>

	<!-- Listendarstellung -->
	<section class="card flex flex-col gap-4 p-4">
		<h2 class="font-semibold">Listendarstellung</h2>
		<div>
			<p class="label">Ansicht</p>
			<div class="grid grid-cols-2 gap-2">
				{#each [['karten', 'Karten'], ['kompakt', 'Kompakte Liste']] as [value, label] (value)}
					<label
						class="cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-medium
							{listStyle === value ? 'border-accent bg-accent-soft text-accent' : 'border-border bg-surface'}"
					>
						<input type="radio" name="_listStyle" {value} bind:group={listStyle} class="sr-only" />
						{label}
					</label>
				{/each}
			</div>
		</div>
		<div>
			<p class="label">Dichte</p>
			<div class="grid grid-cols-2 gap-2">
				{#each [['komfortabel', 'Komfortabel'], ['kompakt', 'Kompakt']] as [value, label] (value)}
					<label
						class="cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-medium
							{density === value ? 'border-accent bg-accent-soft text-accent' : 'border-border bg-surface'}"
					>
						<input type="radio" name="_density" {value} bind:group={density} class="sr-only" />
						{label}
					</label>
				{/each}
			</div>
		</div>
	</section>

	{#if form?.success}
		<p class="rounded-xl bg-ok/10 px-3 py-2 text-sm text-ok">Gespeichert ✓</p>
	{:else if form?.message}
		<p class="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{form.message}</p>
	{/if}

	<button class="btn-primary" type="submit">Speichern</button>
</form>
