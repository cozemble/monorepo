import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import { sveltekit } from '@sveltejs/kit/vite';

const config = {
	plugins: [
		viteCommonjs(),
		sveltekit()
	]
};

export default config;
