import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),

			// Heimnetz-App ohne feste URL: Formular-POSTs von jeder Origin zulassen,
			// damit kein ORIGIN-Env nötig ist. CSRF bleibt durch SameSite=Lax-Cookies
			// abgedeckt (Session wird bei Cross-Site-POSTs nicht mitgesendet).
			csrf: { trustedOrigins: ['*'] },
			typescript: {
				config: (config) => ({
					...config,
					include: [...config.include, '../drizzle.config.ts']
				})
			}
		})
	]
});
