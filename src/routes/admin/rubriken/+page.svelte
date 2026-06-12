<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/Icon.svelte';
	import { COLOR_LABELS, categoryColor } from '$lib/utils/colors';
	import type { Category } from '$lib/server/db/schema';

	let { data, form } = $props();

	const colorEntries = Object.entries(COLOR_LABELS);
</script>

{#snippet categoryList(title: string, scope: string, cats: Category[])}
	<section class="card mb-6 p-4">
		<h2 class="mb-3 font-semibold">{title}</h2>

		<ul class="flex flex-col gap-3">
			{#each cats as cat, i (cat.id)}
				<li class="rounded-xl border border-border p-3 {cat.disabled ? 'opacity-60' : ''}">
					<div class="flex items-start gap-2">
						<span
							class="mt-1 h-3 w-3 shrink-0 rounded-full"
							style="background: {categoryColor(cat.color)}"
						></span>
						<form method="POST" action="?/update" use:enhance class="min-w-0 flex-1">
							<input type="hidden" name="id" value={cat.id} />
							<div class="flex flex-wrap items-center gap-2">
								<input
									class="input max-w-14 px-2 text-center"
									name="icon"
									value={cat.icon}
									placeholder="🙂"
									aria-label="Icon"
								/>
								<input
									class="input min-w-32 flex-1"
									name="name"
									value={cat.name}
									required
									aria-label="Name"
								/>
								<select class="input max-w-32" name="color" aria-label="Farbe">
									{#each colorEntries as [key, label] (key)}
										<option value={key} selected={key === cat.color}>{label}</option>
									{/each}
								</select>
								<button class="btn-ghost px-3 py-2 text-sm" type="submit">Speichern</button>
							</div>
						</form>
					</div>
					<div class="mt-2 flex items-center gap-1.5">
						<form method="POST" action="?/move" use:enhance>
							<input type="hidden" name="id" value={cat.id} />
							<input type="hidden" name="dir" value="up" />
							<button class="btn-ghost p-2" type="submit" disabled={i === 0} aria-label="Nach oben">
								<Icon name="chevronUp" class="h-4 w-4" />
							</button>
						</form>
						<form method="POST" action="?/move" use:enhance>
							<input type="hidden" name="id" value={cat.id} />
							<input type="hidden" name="dir" value="down" />
							<button
								class="btn-ghost p-2"
								type="submit"
								disabled={i === cats.length - 1}
								aria-label="Nach unten"
							>
								<Icon name="chevronDown" class="h-4 w-4" />
							</button>
						</form>
						<form method="POST" action="?/toggle" use:enhance class="ml-auto">
							<input type="hidden" name="id" value={cat.id} />
							<button class="btn-ghost px-3 py-2 text-sm" type="submit">
								{cat.disabled ? 'Aktivieren' : 'Deaktivieren'}
							</button>
						</form>
					</div>
				</li>
			{/each}
		</ul>

		<form method="POST" action="?/create" use:enhance class="mt-4 border-t border-border pt-4">
			<input type="hidden" name="scope" value={scope} />
			<p class="label">Neue Rubrik</p>
			<div class="flex flex-wrap items-center gap-2">
				<input class="input max-w-14 px-2 text-center" name="icon" placeholder="🙂" aria-label="Icon" />
				<input class="input min-w-32 flex-1" name="name" placeholder="Name" required aria-label="Name" />
				<select class="input max-w-32" name="color" aria-label="Farbe">
					{#each colorEntries as [key, label] (key)}
						<option value={key}>{label}</option>
					{/each}
				</select>
				<button class="btn-primary px-3 py-2 text-sm" type="submit">
					<Icon name="plus" class="h-4 w-4" />
					Anlegen
				</button>
			</div>
		</form>
	</section>
{/snippet}

<h1 class="mb-2 text-2xl font-bold">Rubriken</h1>
<p class="mb-5 text-sm text-muted">
	Rubriken lassen sich jederzeit ergänzen und umsortieren. Deaktivierte Rubriken verschwinden aus
	den Eingabeformularen — bestehende Einträge behalten sie.
</p>

{#if form?.message}
	<p class="mb-4 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{form.message}</p>
{/if}

{@render categoryList('Ausgaben', 'ausgaben', data.ausgaben)}
{@render categoryList('Essen', 'essen', data.essen)}
