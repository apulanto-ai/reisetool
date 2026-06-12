<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Nav from '$lib/components/Nav.svelte';

	let { data, children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{data.tripName || 'Reisetool'}</title>
</svelte:head>

{#if data.user}
	<Nav prefs={data.prefs} tripName={data.tripName} isAdmin={data.user.isAdmin} />
	<div class="md:pl-64 print:pl-0">
		<main class="mx-auto w-full max-w-3xl px-4 pt-5 pb-28 md:pt-8 md:pb-10">
			{@render children()}
		</main>
	</div>
{:else}
	<main class="grid min-h-dvh place-items-center p-4">
		{@render children()}
	</main>
{/if}
