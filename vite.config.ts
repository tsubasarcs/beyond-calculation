import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: true,
		port: 5173,
		strictPort: true,
		watch: {
			usePolling: true
		}
	},
	preview: {
		port: 4173,
		host: true,
		strictPort: true
	}
});
