import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import { sveltekit } from '@sveltejs/kit/vite'

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [viteCommonjs(), sveltekit()],
}

export default config
