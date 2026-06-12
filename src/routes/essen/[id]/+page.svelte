<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/Icon.svelte';

	let { data, form } = $props();
</script>

<div class="mb-5 flex items-center justify-between">
	<h1 class="text-2xl font-bold">Eintrag bearbeiten</h1>
	<a href="/essen" class="text-sm text-muted hover:text-text">Zurück</a>
</div>

<form method="POST" action="?/update" use:enhance class="card flex flex-col gap-3 p-4">
	<div class="grid grid-cols-2 gap-3">
		<div>
			<label class="label" for="item">Was?</label>
			<input class="input" id="item" name="item" value={data.entry.item} required />
		</div>
		<div>
			<label class="label" for="quantity">Menge</label>
			<input class="input" id="quantity" name="quantity" value={data.entry.quantity} />
		</div>
	</div>
	<div class="grid grid-cols-2 gap-3">
		<div>
			<label class="label" for="categoryId">Rubrik</label>
			<select class="input" id="categoryId" name="categoryId" required>
				{#each data.cats.filter((c) => !c.disabled || c.id === data.entry.categoryId) as cat (cat.id)}
					<option value={cat.id} selected={cat.id === data.entry.categoryId}>
						{cat.icon} {cat.name}
					</option>
				{/each}
			</select>
		</div>
		<div>
			<label class="label" for="date">Datum</label>
			<input class="input" id="date" name="date" type="date" value={data.entry.date} required />
		</div>
	</div>
	<div>
		<label class="label" for="notes">Notiz</label>
		<textarea class="input" id="notes" name="notes" rows="2">{data.entry.notes}</textarea>
	</div>

	{#if form?.message}
		<p class="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{form.message}</p>
	{/if}

	<button class="btn-primary" type="submit">Speichern</button>
</form>

<form
	method="POST"
	action="?/delete"
	use:enhance
	class="mt-4"
	onsubmit={(e) => {
		if (!confirm('Diesen Eintrag wirklich löschen?')) e.preventDefault();
	}}
>
	<button class="btn-danger w-full" type="submit">
		<Icon name="trash" class="h-5 w-5" />
		Eintrag löschen
	</button>
</form>
