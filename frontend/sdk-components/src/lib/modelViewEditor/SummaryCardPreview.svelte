<script lang="ts">
    import type {DataRecord, Model} from "@cozemble/model-core";
    import {applyTemplate, modelToJson} from '@cozemble/model-to-json'
    import {afterUpdate} from 'svelte'

    export let record: DataRecord
    export let models: Model[]
    export let index: number
    export let template: string

    afterUpdate(() => console.log({template, record, models, index, htmlRender, json:modelToJson(models, record)}))
    $:htmlRender = applyTemplate(template, modelToJson(models, record))
</script>

{#if htmlRender}
    {@html htmlRender}
{:else}
    ----
{/if}