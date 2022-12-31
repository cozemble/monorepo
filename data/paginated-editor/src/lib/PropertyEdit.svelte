<script lang="ts">
    import type {DataRecord, Property} from "@cozemble/model-core";
    import {propertyEditorRegistry} from "@cozemble/model-assembled";
    import {afterUpdate} from 'svelte'

    export let property: Property
    export let record: DataRecord

    $: editor = propertyEditorRegistry.get(property._type)

    afterUpdate(() => {
        console.log({property, record, editor})
    })
</script>

{#if editor}
    <svelte:component this={editor} property={property} record={record}/>
{:else}
    <div>Unknown property type: {property._type}</div>
{/if}