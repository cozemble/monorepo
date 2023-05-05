<script lang="ts">
    import type {DataRecord} from "@cozemble/model-core";
    import {applyTemplate, modelToJson} from '@cozemble/model-to-json'
    import {eventSourcedModels} from "./modelsStore";

    export let record: DataRecord
    export let index: number
    export let template: string
    const models = $eventSourcedModels.map(m => m.model)
    $:htmlRender = applyTemplate(template, modelToJson(models, record))
</script>

{#if htmlRender}
    {@html htmlRender}
{:else}
    ----
{/if}