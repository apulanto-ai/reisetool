<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { IconName } from '$lib/components/icons';

	let { data } = $props();

	const links: Array<{ href: string; icon: IconName; label: string; hint: string }> = [
		{ href: '/export', icon: 'download', label: 'Export', hint: 'CSV, JSON & Reisebericht' },
		{
			href: '/einstellungen',
			icon: 'sliders',
			label: 'Einstellungen',
			hint: 'Theme, Passwort, Darstellung'
		}
	];
	const adminLinks: Array<{ href: string; icon: IconName; label: string; hint: string }> = [
		{ href: '/admin/benutzer', icon: 'users', label: 'Benutzer', hint: 'Konten verwalten' },
		{ href: '/admin/rubriken', icon: 'tag', label: 'Rubriken', hint: 'Kategorien anpassen' }
	];
</script>

<h1 class="mb-5 text-2xl font-bold">Mehr</h1>

<div class="card mb-5 flex items-center gap-3 p-4">
	<div class="grid h-11 w-11 place-items-center rounded-full bg-accent-soft text-lg font-bold text-accent">
		{data.user?.displayName?.charAt(0)?.toUpperCase()}
	</div>
	<div>
		<p class="font-semibold">{data.user?.displayName}</p>
		<p class="text-sm text-muted">
			@{data.user?.username}{data.user?.isAdmin ? ' · Admin' : ''}
		</p>
	</div>
</div>

<div class="flex flex-col gap-2">
	{#each links as link (link.href)}
		<a href={link.href} class="card flex items-center gap-3 p-4 transition hover:border-accent">
			<Icon name={link.icon} class="h-6 w-6 text-accent" />
			<div>
				<p class="font-medium">{link.label}</p>
				<p class="text-xs text-muted">{link.hint}</p>
			</div>
		</a>
	{/each}

	{#if data.user?.isAdmin}
		<p class="mt-3 mb-1 px-1 text-xs font-semibold tracking-wide text-muted uppercase">Admin</p>
		{#each adminLinks as link (link.href)}
			<a href={link.href} class="card flex items-center gap-3 p-4 transition hover:border-accent">
				<Icon name={link.icon} class="h-6 w-6 text-accent" />
				<div>
					<p class="font-medium">{link.label}</p>
					<p class="text-xs text-muted">{link.hint}</p>
				</div>
			</a>
		{/each}
	{/if}
</div>

<form method="POST" action="/logout" class="mt-6">
	<button class="btn-ghost w-full" type="submit">
		<Icon name="logout" class="h-5 w-5" />
		Abmelden
	</button>
</form>
