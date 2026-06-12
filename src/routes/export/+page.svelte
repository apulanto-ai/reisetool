<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
</script>

<h1 class="mb-2 text-2xl font-bold">Export</h1>
<p class="mb-5 text-sm text-muted">
	CSV-Dateien lassen sich direkt in Excel öffnen (deutsches Format). Der JSON-Export enthält alle
	Daten und eignet sich als Backup.
</p>

<div class="flex flex-col gap-2">
	<a href="/export/csv/ausgaben" class="card flex items-center gap-3 p-4 transition hover:border-accent" download>
		<Icon name="download" class="h-6 w-6 text-accent" />
		<div>
			<p class="font-medium">Ausgaben als CSV</p>
			<p class="text-xs text-muted">Datum, Betrag, Rubrik, Bezahlt von …</p>
		</div>
	</a>
	<a href="/export/csv/essen" class="card flex items-center gap-3 p-4 transition hover:border-accent" download>
		<Icon name="download" class="h-6 w-6 text-accent" />
		<div>
			<p class="font-medium">Essen als CSV</p>
			<p class="text-xs text-muted">Einkäufe und Verbrauch</p>
		</div>
	</a>
	<a href="/export/csv/tagebuch" class="card flex items-center gap-3 p-4 transition hover:border-accent" download>
		<Icon name="download" class="h-6 w-6 text-accent" />
		<div>
			<p class="font-medium">Tagebuch als CSV</p>
			<p class="text-xs text-muted">Alle Einträge mit km, Laden, Wetter</p>
		</div>
	</a>
	<a href="/export/json" class="card flex items-center gap-3 p-4 transition hover:border-accent" download>
		<Icon name="download" class="h-6 w-6 text-accent" />
		<div>
			<p class="font-medium">Komplett-Export als JSON</p>
			<p class="text-xs text-muted">Alle Daten — eignet sich als Backup</p>
		</div>
	</a>
	<a href="/export/bericht" class="card flex items-center gap-3 p-4 transition hover:border-accent">
		<Icon name="book" class="h-6 w-6 text-accent" />
		<div>
			<p class="font-medium">Reisebericht</p>
			<p class="text-xs text-muted">Druckansicht — als PDF speichern über „Drucken"</p>
		</div>
	</a>
</div>

<p class="mt-6 rounded-xl bg-surface-2 p-3 text-xs text-muted">
	💡 Vollständiges Backup: Auf dem Unraid-Server die Datei
	<code class="font-mono">reisetool.db</code> aus dem appdata-Ordner kopieren.
</p>
