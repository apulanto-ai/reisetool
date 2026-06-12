<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<div class="card w-full max-w-md p-6 sm:p-8">
	<div class="mb-6 text-center">
		<div class="text-4xl">🚲</div>
		<h1 class="mt-2 text-xl font-bold">Willkommen beim Reisetool</h1>
		<p class="mt-1 text-sm text-muted">
			Einmalige Einrichtung: Lege die Reise und das Admin-Konto an.
		</p>
	</div>

	<form method="POST" use:enhance class="flex flex-col gap-4">
		<div>
			<label class="label" for="tripName">Name der Reise</label>
			<input
				class="input"
				id="tripName"
				name="tripName"
				placeholder="z.B. Donauradweg 2026"
				value={form?.tripName ?? ''}
				required
			/>
		</div>
		<div>
			<label class="label" for="tripStartDate">Startdatum (optional)</label>
			<input
				class="input"
				id="tripStartDate"
				name="tripStartDate"
				type="date"
				value={form?.tripStartDate ?? ''}
			/>
		</div>

		<div class="my-1 border-t border-border"></div>
		<p class="text-sm font-semibold">Admin-Konto</p>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div>
				<label class="label" for="username">Benutzername</label>
				<input
					class="input"
					id="username"
					name="username"
					autocapitalize="none"
					autocomplete="username"
					value={form?.username ?? ''}
					required
				/>
			</div>
			<div>
				<label class="label" for="displayName">Anzeigename</label>
				<input
					class="input"
					id="displayName"
					name="displayName"
					placeholder="z.B. Papa"
					value={form?.displayName ?? ''}
					required
				/>
			</div>
		</div>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div>
				<label class="label" for="password">Passwort</label>
				<input
					class="input"
					id="password"
					name="password"
					type="password"
					autocomplete="new-password"
					required
				/>
			</div>
			<div>
				<label class="label" for="password2">Passwort wiederholen</label>
				<input
					class="input"
					id="password2"
					name="password2"
					type="password"
					autocomplete="new-password"
					required
				/>
			</div>
		</div>

		{#if form?.message}
			<p class="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{form.message}</p>
		{/if}

		<button class="btn-primary mt-1" type="submit">Los geht's 🚀</button>
	</form>
</div>
