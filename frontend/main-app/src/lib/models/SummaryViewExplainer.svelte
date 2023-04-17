<script lang="ts">
    import type {Model} from "@cozemble/model-core";
    import {explainTemplateForModel} from "./explainTemplateForModel";

    export let model: Model
    export let setTemplate: (template: string) => void
    const explain = explainTemplateForModel(model)
</script>

{#if explain._type === "message"}
    <span class="label-text-alt">{explain.message}</span>
{:else}
    <span class="label-text-alt">Example: {explain.example} <a class="link"
                                                               on:click={() => setTemplate(explain.example)}>Use this</a></span>
{/if}