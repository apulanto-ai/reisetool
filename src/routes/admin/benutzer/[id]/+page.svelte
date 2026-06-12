<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/Icon.svelte';

	let { data, form } = $props();
	let isSelf = $derived(data.managedUser.id === data.user?.id);
</script>

<div class="mb-5 flex items-center justify-between">
	<div>
		<h1 class="text-2xl font-bold">{data.managedUser.displayName}</h1>
		<p class="text-sm text-muted">
			@{data.managedUser.username} · {data.entryCount} Einträge
		</p>
	</div>
	<a href="/admin/benutzer" class="text-sm text-muted hover:text-text">Zurück</a>
</div>

{#if form?.message}
	<p class="mb-4 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{form.message}</p>
{:else if form?.success}
	<p class="mb-4 rounded-xl bg-ok/10 px-3 py-2 text-sm text-ok">Gespeichert ✓</p>
{/if}

<form method="POST" action="?/update" use:enhance class="card mb-5 flex flex-col gap-3 p-4">
	<h2 class="font-semibold">Profil</h2>
	<div>
		<label class="label" for="displayName">Anzeigename</label>
		<input class="input" id="displayName" name="displayName" value={data.managedUser.displayName} required />
	</div>
	<label class="flex items-center gap-2 text-sm">
		<input
			type="checkbox"
			name="isAdmin"
			checked={data.managedUser.isAdmin}
			disabled={isSelf}
			class="h-5 w-5 accent-[var(--accent)]"
		/>
		Admin-Rechte
		{#if isSelf}<span class="text-xs text-muted">(eigenes Konto)</span>{/if}
	</label>
	{#if isSelf && data.managedUser.isAdmin}
		<input type="hidden" name="isAdmin" value="on" />
	{/if}
	<button class="btn-primary self-start" type="submit">Speichern</button>
</form>

<form method="POST" action="?/resetPassword" use:enhance class="card mb-5 flex flex-col gap-3 p-4">
	<h2 class="font-semibold">Passwort zurücksetzen</h2>
	<div>
		<label class="label" for="next">Neues Passwort</label>
		<input class="input" id="next" name="next" type="password" autocomplete="new-password" required />
	</div>
	<p class="text-xs text-muted">Alle Sitzungen dieses Benutzers werden abgemeldet.</p>
	<button class="btn-primary self-start" type="submit">Zurücksetzen</button>
</form>

{#if !isSelf}
	<div class="flex flex-col gap-3 sm:flex-row">
		<form method="POST" action="?/toggleDisabled" use:enhance class="flex-1">
			<button class="btn-ghost w-full" type="submit">
				{data.managedUser.disabled ? 'Wieder aktivieren' : 'Deaktivieren'}
			</button>
		</form>
		{#if data.entryCount === 0}
			<form
				method="POST"
				action="?/delete"
				use:enhance
				class="flex-1"
				onsubmit={(e) => {
					if (!confirm('Diesen Benutzer wirklich löschen?')) e.preventDefault();
				}}
			>
				<button class="btn-danger w-full" type="submit">
					<Icon name="trash" class="h-5 w-5" />
					Löschen
				</button>
			</form>
		{/if}
	</div>
{/if}
