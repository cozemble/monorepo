// vite.config.ts
import { sveltekit } from "file:///Users/mattstronge/Documents/GitHub/monorepo/node_modules/.pnpm/@sveltejs+kit@1.5.0_svelte@3.54.0_vite@4.4.3/node_modules/@sveltejs/kit/src/exports/vite/index.js";
var config = {
  plugins: [sveltekit()],
  ssr: {
    noExternal: [
      "@cozemble/backend-tenanted-api-types",
      "@cozemble/data-filters-core",
      "@cozemble/lang-util",
      "@cozemble/frontend-bff",
      "@cozemble/model-core",
      "@cozemble/model-properties-core",
      "@cozemble/model-api",
      "@cozemble/model-event-sourced",
      "@cozemble/model-registries",
      "@cozemble/data-editor-sdk",
      "@cozemble/model-to-json",
      "@cozemble/model-attachment-core",
      "@cozemble/model-assembled",
      "svelte-jsoneditor",
      "svelte-awesome",
      "svelte-select"
    ]
  }
};
var vite_config_default = config;
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbWF0dHN0cm9uZ2UvRG9jdW1lbnRzL0dpdEh1Yi9tb25vcmVwby9tb2RlbC9hdHRhY2htZW50L3VpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvbWF0dHN0cm9uZ2UvRG9jdW1lbnRzL0dpdEh1Yi9tb25vcmVwby9tb2RlbC9hdHRhY2htZW50L3VpL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9tYXR0c3Ryb25nZS9Eb2N1bWVudHMvR2l0SHViL21vbm9yZXBvL21vZGVsL2F0dGFjaG1lbnQvdWkvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tICdAc3ZlbHRlanMva2l0L3ZpdGUnXG5cbmNvbnN0IGNvbmZpZyA9IHtcbiAgcGx1Z2luczogW3N2ZWx0ZWtpdCgpXSxcbiAgc3NyOiB7XG4gICAgbm9FeHRlcm5hbDogW1xuICAgICAgJ0Bjb3plbWJsZS9iYWNrZW5kLXRlbmFudGVkLWFwaS10eXBlcycsIFxuICAgICAgJ0Bjb3plbWJsZS9kYXRhLWZpbHRlcnMtY29yZScsXG4gICAgICAnQGNvemVtYmxlL2xhbmctdXRpbCcsXG4gICAgICAnQGNvemVtYmxlL2Zyb250ZW5kLWJmZicsXG4gICAgICAnQGNvemVtYmxlL21vZGVsLWNvcmUnLFxuICAgICAgJ0Bjb3plbWJsZS9tb2RlbC1wcm9wZXJ0aWVzLWNvcmUnLFxuICAgICAgJ0Bjb3plbWJsZS9tb2RlbC1hcGknLFxuICAgICAgJ0Bjb3plbWJsZS9tb2RlbC1ldmVudC1zb3VyY2VkJyxcbiAgICAgICdAY296ZW1ibGUvbW9kZWwtcmVnaXN0cmllcycsXG4gICAgICAnQGNvemVtYmxlL2RhdGEtZWRpdG9yLXNkaycsXG4gICAgICAnQGNvemVtYmxlL21vZGVsLXRvLWpzb24nLFxuICAgICAgJ0Bjb3plbWJsZS9tb2RlbC1hdHRhY2htZW50LWNvcmUnLFxuICAgICAgJ0Bjb3plbWJsZS9tb2RlbC1hc3NlbWJsZWQnLFxuICAgICAgJ3N2ZWx0ZS1qc29uZWRpdG9yJyxcbiAgICAgICdzdmVsdGUtYXdlc29tZScsXG4gICAgICAnc3ZlbHRlLXNlbGVjdCdcbiAgICBdLFxuICB9LFxufVxuXG5leHBvcnQgZGVmYXVsdCBjb25maWdcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBa1gsU0FBUyxpQkFBaUI7QUFFNVksSUFBTSxTQUFTO0FBQUEsRUFDYixTQUFTLENBQUMsVUFBVSxDQUFDO0FBQUEsRUFDckIsS0FBSztBQUFBLElBQ0gsWUFBWTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGO0FBRUEsSUFBTyxzQkFBUTsiLAogICJuYW1lcyI6IFtdCn0K
