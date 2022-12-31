<script lang="ts">
    import type {DataRecord, Property} from "@cozemble/model-core";
    import {dataRecordPaths} from "@cozemble/model-core";
    import {propertyEditorRegistry} from "@cozemble/model-assembled";

    export let property: Property
    export let record: DataRecord

    $: editor = propertyEditorRegistry.get(property._type)
</script>

{#if editor}
    <svelte:component this={editor} recordPath={dataRecordPaths.newInstance(property)} record={record}/>
{:else}
    <div>Unknown property type: {property._type}</div>
{/if}