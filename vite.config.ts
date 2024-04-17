import { fileURLToPath, URL } from 'node:url';
import { crx } from '@crxjs/vite-plugin';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

import manifest from './manifest.json';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		crx({ manifest })
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	},
	server: {
		port: 3000
	},
	build: {
		target: 'esnext'
	}
});