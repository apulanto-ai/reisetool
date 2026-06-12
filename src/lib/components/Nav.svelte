<script lang="ts">
	import { page } from '$app/state';
	import Icon from './Icon.svelte';
	import type { IconName } from './icons';
	import { MODULE_LABELS, type ModuleId, type Prefs } from '$lib/utils/prefs';

	let {
		prefs,
		tripName,
		isAdmin
	}: { prefs: Prefs; tripName: string; isAdmin: boolean } = $props();

	const moduleMeta: Record<ModuleId, { href: string; icon: IconName }> = {
		start: { href: '/', icon: 'home' },
		ausgaben: { href: '/ausgaben', icon: 'wallet' },
		essen: { href: '/essen', icon: 'cart' },
		tagebuch: { href: '/tagebuch', icon: 'book' }
	};

	let tabs = $derived(
		prefs.tabOrder.map((id) => ({ id, label: MODULE_LABELS[id], ...moduleMeta[id] }))
	);

	function isActive(href: string): boolean {
		const p = page.url.pathname;
		return href === '/' ? p === '/' : p === href || p.startsWith(href + '/');
	}
</script>

{#snippet sideLink(href: string, icon: IconName, label: string)}
	<a
		href={href}
		class="flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition
			{isActive(href) ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface-2 hover:text-text'}"
	>
		<Icon name={icon} class="h-5 w-5" />
		{label}
	</a>
{/snippet}

<!-- Mobile: Bottom-Tab-Bar -->
<nav
	class="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur md:hidden print:hidden"
	style="padding-bottom: env(safe-area-inset-bottom)"
>
	<div class="grid grid-cols-5">
		{#each tabs as tab (tab.id)}
			<a
				href={tab.href}
				class="flex flex-col items-center gap-0.5 pt-2 pb-1.5 text-[11px] font-medium
					{isActive(tab.href) ? 'text-accent' : 'text-muted'}"
			>
				<Icon name={tab.icon} class="h-6 w-6" />
				{tab.label}
			</a>
		{/each}
		<a
			href="/mehr"
			class="flex flex-col items-center gap-0.5 pt-2 pb-1.5 text-[11px] font-medium
				{isActive('/mehr') || isActive('/einstellungen') || isActive('/export') || isActive('/admin')
				? 'text-accent'
				: 'text-muted'}"
		>
			<Icon name="dots" class="h-6 w-6" />
			Mehr
		</a>
	</div>
</nav>

<!-- Desktop: Sidebar -->
<aside
	class="hidden border-r border-border bg-surface md:fixed md:inset-y-0 md:z-20 md:flex md:w-64 md:flex-col md:px-4 md:py-6 print:hidden!"
>
	<a href="/" class="mb-6 flex items-center gap-2 px-3 text-lg font-bold">
		<span class="text-2xl">🚲</span>
		<span class="truncate">{tripName || 'Reisetool'}</span>
	</a>
	<div class="flex flex-1 flex-col gap-1">
		{#each tabs as tab (tab.id)}
			{@render sideLink(tab.href, tab.icon, tab.label)}
		{/each}
		<div class="my-3 border-t border-border"></div>
		{@render sideLink('/export', 'download', 'Export')}
		{@render sideLink('/einstellungen', 'sliders', 'Einstellungen')}
		{#if isAdmin}
			<div class="my-3 border-t border-border"></div>
			<p class="px-3 pb-1 text-xs font-semibold tracking-wide text-muted uppercase">Admin</p>
			{@render sideLink('/admin/benutzer', 'users', 'Benutzer')}
			{@render sideLink('/admin/rubriken', 'tag', 'Rubriken')}
		{/if}
	</div>
	<form method="POST" action="/logout">
		<button
			type="submit"
			class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-muted transition hover:bg-surface-2 hover:text-text"
		>
			<Icon name="logout" class="h-5 w-5" />
			Abmelden
		</button>
	</form>
</aside>
