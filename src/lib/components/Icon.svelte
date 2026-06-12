<script lang="ts">
	import { icons, type IconName } from './icons';

	let { name, class: cls = 'h-6 w-6' }: { name: IconName; class?: string } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.8"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={cls}
	aria-hidden="true"
>
	{#each icons[name] as d (d)}
		<path {d} />
	{/each}
</svg>
