<script lang="ts">
    import {EditableName, PencilIcon} from '@cozemble/ui-atoms'
    import type {ModelEditorHost} from './ModelEditorHost'
    import ModelStructureEditor from './ModelStructureEditor.svelte'
    import type {ModelId, SystemConfiguration} from '@cozemble/model-core'
    import {modelNameFns} from '@cozemble/model-core'
    import type {EventSourcedModelList} from "@cozemble/model-event-sourced";
    import {coreModelEvents, eventSourcedModelListFns} from '@cozemble/model-event-sourced'
    import type {Writable} from 'svelte/store'

    export let modelId: ModelId
    export let host: ModelEditorHost
    export let modelList: Writable<EventSourcedModelList>
    export let systemConfiguration: SystemConfiguration
    export let editImmediately = false

    $: eventSourced = eventSourcedModelListFns.modelWithId($modelList, modelId)

    function onNameChange(name: string) {
        modelList.update(list => eventSourcedModelListFns.addModelEvent(list, coreModelEvents.modelRenamed(
            eventSourced.model.id,
            modelNameFns.newInstance(name),
        )))
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
        <ModelStructureEditor {systemConfiguration} {eventSourced} {host} {modelList} on:editingSomething/>
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