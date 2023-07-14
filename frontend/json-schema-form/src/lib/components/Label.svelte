<script lang="ts">
    import type {JsonSchemaProperty} from "@cozemble/model-core";
    import {strings} from "@cozemble/lang-util";
    import {Info} from "@cozemble/ui-atoms";

    export let propertyKey: string
    export let property: JsonSchemaProperty
    export let clazz = ""
    let showHelp = false
</script>

<div class="flex">
    <label class={clazz}>{property.title ?? strings.camelcaseToSentenceCase(propertyKey)}</label>
    {#if property.description}
        <div class="ml-2" on:click={() => showHelp = !showHelp}>
            <Info/>
        </div>
    {/if}
</div>
{#if showHelp}
    <div>
        <div class="text-sm text-gray-600">{property.description}</div>
    </div>
{/if}
