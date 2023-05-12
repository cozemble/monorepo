<script lang="ts">
    import type {DataRecord, Model} from "@cozemble/model-core";
    import {applyTemplate, modelToJson} from '@cozemble/model-to-json'

    export let record: DataRecord
    export let models: Model[]
    export let index: number
    export let template: string

    $:htmlRender = applyTemplate(template, modelToJson(models, record))
</script>

{#if htmlRender}
    {@html htmlRender}
{:else}
    ----
{/if}