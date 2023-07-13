import { sveltekit } from '@sveltejs/kit/vite'

const config = {
  plugins: [sveltekit()],
  resolve: {
    preserveSymlinks: true,
  },
  ssr: {
    noExternal: [
      '@cozemble/backend-tenanted-api-types', 
      '@cozemble/data-filters-core',
      '@cozemble/lang-util',
      '@cozemble/frontend-bff',
      '@cozemble/model-core',
      '@cozemble/model-properties-core',
      '@cozemble/model-api',
      '@cozemble/model-event-sourced',
      '@cozemble/model-registries',
      '@cozemble/data-editor-sdk',
      '@cozemble/model-to-json',
      '@cozemble/model-attachment-core',
      '@cozemble/model-assembled',
      'svelte-jsoneditor',
      'svelte-awesome',
      'svelte-select'
    ],
  },
}

export default config
