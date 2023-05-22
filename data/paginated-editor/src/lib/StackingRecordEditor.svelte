<script lang="ts">
    import {createDependentRecordContext, type RecordEditContext} from './RecordEditContext'
    import EditRecord from './EditRecord.svelte'
    import type {RecordSearcher} from "./RecordSearcher";
    import type {RecordCreator} from "./RecordCreator";
    import type {DataRecord, ModelId} from "@cozemble/model-core";
    import type {AttachmentsManager} from "./AttachmentsManager";
    import type {ModelViewManager} from "@cozemble/data-editor-sdk";
    import type {EventSourcedRecordGraph} from "@cozemble/model-event-sourced/dist/esm/index.js";
    import {
        eventSourcedDataRecordFns,
        eventSourcedRecordGraphFns
    } from "@cozemble/model-event-sourced/dist/esm/index.js";

    export let recordEditContext: RecordEditContext
    export let recordSearcher: RecordSearcher
    export let modelViewManager: ModelViewManager
    export let attachmentsManager: AttachmentsManager
    export let cancelButtonText = "Cancel"

    let stack: RecordEditContext[] = [recordEditContext]

    function visibleStackItem() {
        return stack[stack.length - 1]
    }

    function pushContext(context: RecordEditContext) {
        const current = visibleStackItem()
        context.prefixTitle(current.title + ' > ')

        stack = [...stack, context]
    }

    function popContext() {
        stack = stack.slice(0, -1)
    }

    const recordCreator: RecordCreator = {
        createNewRecord(modelId: ModelId): Promise<EventSourcedRecordGraph | null> {
            return new Promise((resolve, reject) => {
                const newContext = createDependentRecordContext(recordEditContext, modelId, async (record) => {
                    const outcome = await recordEditContext.saveNewRecord(record);
                    if (outcome._type === "record.save.succeeded") {
                        popContext()
                        resolve(eventSourcedRecordGraphFns.newInstance([eventSourcedDataRecordFns.fromRecord(recordEditContext.models, outcome.record)],[],[]))
                    } else {
                        popContext()
                        reject(outcome.errors.join(", "))
                    }
                    return outcome
                }, () => {
                    popContext()
                    resolve(null)
                })
                pushContext(newContext)
            })
        }
    }
</script>

{#each stack as stackElement, index}
    {@const hidden = index !== (stack.length - 1)}
    {#key stackElement.id}
        <div class:hidden>
            <EditRecord recordEditContext={stackElement}
                        {recordSearcher}
                        {recordCreator}
                        {attachmentsManager}
                        {modelViewManager}
                        {pushContext}
                        {popContext}
                        {cancelButtonText}/>
        </div>
    {/key}
{/each}

<style>
    .hidden {
        display: none;
    }
</style>
