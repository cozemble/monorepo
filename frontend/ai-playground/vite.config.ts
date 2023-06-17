import { viteCommonjs } from '@originjs/vite-plugin-commonjs'

import { sveltekit } from '@sveltejs/kit/vite'
import type { UserConfig } from 'vite'

const config: UserConfig = {
  plugins: [viteCommonjs(), sveltekit()],
}

export default config
