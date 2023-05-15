<script lang="ts">
    import {EditableName, PencilIcon} from '@cozemble/ui-atoms'
    import type {ModelEditorHost} from './ModelEditorHost'
    import ModelStructureEditor from './ModelStructureEditor.svelte'
    import type {ModelId, SystemConfiguration} from '@cozemble/model-core'
    import {modelNameFns} from '@cozemble/model-core'
    import type {EventSourcedModelGraph} from "@cozemble/model-event-sourced";
    import {coreModelEvents} from '@cozemble/model-event-sourced'
    import type {Writable} from 'svelte/store'

    export let modelId: ModelId
    export let host: ModelEditorHost
    export let modelGraph: Writable<EventSourcedModelGraph>
    export let systemConfiguration: SystemConfiguration
    export let editImmediately = false

    $: eventSourced = host.modelWithId($modelGraph, modelId)

    function onNameChange(name: string) {
        host.modelChanged(
            modelId,
            coreModelEvents.modelRenamed(
                eventSourced.model.id,
                modelNameFns.newInstance(name),
            ),
        )
    }

</script>

{#if eventSourced}
    <div class="flex">
        <EditableName
                nameable={{ name: eventSourced.model.name.value }}
                {onNameChange} {editImmediately}
                extraClass="model-name"/>
        <div class="icon-container">
            <PencilIcon/>
        </div>
    </div>

    <div class="mt-2">
        <ModelStructureEditor {systemConfiguration} {eventSourced} {host} {modelGraph} on:editingSomething/>
    </div>
{/if}

<style>
    .flex {
        display: flex;
        align-items: center;
        flex-direction: row;
    }

    .icon-container {
        margin-left: 0.5em;
        width: 1em;
    }
</style>