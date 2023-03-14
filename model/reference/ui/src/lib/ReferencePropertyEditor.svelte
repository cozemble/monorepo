<script lang="ts">
    import type {DataRecord, DataRecordPath} from '@cozemble/model-core'
    import {dataRecordControlEvents, dataRecordEditor,} from '@cozemble/data-editor-sdk'
    import type {ReferenceProperty} from "@cozemble/model-reference-core";
    import {referencePropertyFns} from "@cozemble/model-reference-core";
    import {onMount} from "svelte";

    export let recordPath: DataRecordPath
    export let record: DataRecord
    let property = recordPath.lastElement as ReferenceProperty
    let error: string | null = null
    if (property.propertyType.type !== "reference.property") {
        error = "This is not a reference property"
    }
    const dataRecordEditorClient = dataRecordEditor.getClient()
    let options: DataRecord[] = []
    let searchTerm = ""

    function cancel(event: MouseEvent) {
        event.preventDefault()
        event.stopPropagation()

        dataRecordEditorClient.dispatchControlEvent(
            dataRecordControlEvents.editAborted(record, recordPath),
        )
    }

    onMount(async () => {
        const referencedModelId = referencePropertyFns.oneReference(property)
        if (!referencedModelId) {
            error = "No referenced model"
        } else {
            options =  await dataRecordEditorClient.searchRecords(referencedModelId, searchTerm)
        }
    })

</script>

<select>
    {#each options as option}
        <option value={option.id.value}>{JSON.stringify(option)}</option>
    {/each}
</select>
<button on:click={cancel}>Cancel</button>

{#if error}
    <p>{error}</p>
{/if}