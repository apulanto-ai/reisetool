<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/Icon.svelte';

	let { data, form } = $props();
</script>

<h1 class="mb-5 text-2xl font-bold">Benutzer</h1>

<div class="mb-5 flex flex-col gap-2">
	{#each data.list as u (u.id)}
		<a href="/admin/benutzer/{u.id}" class="card flex items-center gap-3 p-4 transition hover:border-accent">
			<div class="grid h-10 w-10 place-items-center rounded-full bg-accent-soft font-bold text-accent">
				{u.displayName.charAt(0).toUpperCase()}
			</div>
			<div class="min-w-0 flex-1">
				<p class="truncate font-medium {u.disabled ? 'text-muted line-through' : ''}">
					{u.displayName}
				</p>
				<p class="text-xs text-muted">@{u.username}</p>
			</div>
			{#if u.isAdmin}
				<span class="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">Admin</span>
			{/if}
			{#if u.disabled}
				<span class="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted">deaktiviert</span>
			{/if}
		</a>
	{/each}
</div>

<form method="POST" action="?/create" use:enhance class="card flex flex-col gap-3 p-4">
	<h2 class="font-semibold">Neuen Benutzer anlegen</h2>
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
		<div>
			<label class="label" for="username">Benutzername</label>
			<input class="input" id="username" name="username" autocapitalize="none" value={form?.username ?? ''} required />
		</div>
		<div>
			<label class="label" for="displayName">Anzeigename</label>
			<input class="input" id="displayName" name="displayName" value={form?.displayName ?? ''} required />
		</div>
	</div>
	<div>
		<label class="label" for="password">Start-Passwort</label>
		<input class="input" id="password" name="password" type="password" autocomplete="new-password" required />
	</div>
	<label class="flex items-center gap-2 text-sm">
		<input type="checkbox" name="isAdmin" class="h-5 w-5 accent-[var(--accent)]" />
		Admin-Rechte
	</label>

	{#if form?.message}
		<p class="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{form.message}</p>
	{:else if form?.success}
		<p class="rounded-xl bg-ok/10 px-3 py-2 text-sm text-ok">Benutzer angelegt ✓</p>
	{/if}

	<button class="btn-primary" type="submit">
		<Icon name="plus" class="h-5 w-5" />
		Benutzer anlegen
	</button>
</form>
