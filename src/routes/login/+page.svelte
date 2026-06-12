<script lang="ts">
	import { enhance } from '$app/forms';

	let { form, data } = $props();
	let submitting = $state(false);
</script>

<div class="card w-full max-w-sm p-6 sm:p-8">
	<div class="mb-6 text-center">
		<div class="text-4xl">🚲</div>
		<h1 class="mt-2 text-xl font-bold">{data.tripName || 'Reisetool'}</h1>
		<p class="mt-1 text-sm text-muted">Bitte melde dich an</p>
	</div>

	<form
		method="POST"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				submitting = false;
				await update();
			};
		}}
		class="flex flex-col gap-4"
	>
		<div>
			<label class="label" for="username">Benutzername</label>
			<input
				class="input"
				id="username"
				name="username"
				autocomplete="username"
				autocapitalize="none"
				value={form?.username ?? ''}
				required
			/>
		</div>
		<div>
			<label class="label" for="password">Passwort</label>
			<input
				class="input"
				id="password"
				name="password"
				type="password"
				autocomplete="current-password"
				required
			/>
		</div>

		{#if form?.message}
			<p class="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{form.message}</p>
		{/if}

		<button class="btn-primary mt-1" type="submit" disabled={submitting}>
			{submitting ? 'Anmelden …' : 'Anmelden'}
		</button>
	</form>
</div>
