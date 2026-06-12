<script lang="ts">
	import { categoryColor } from '$lib/utils/colors';

	let { name, color, icon = '' }: { name: string; color: string; icon?: string } = $props();
	let hex = $derived(categoryColor(color));
</script>

<span
	class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
	style="background: color-mix(in srgb, {hex} 14%, transparent); color: {hex}"
>
	{#if icon}<span>{icon}</span>{/if}
	{name}
</span>
