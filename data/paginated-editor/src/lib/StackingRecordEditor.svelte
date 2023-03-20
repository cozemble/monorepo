<script lang="ts">
    import {createDependentRecordContext, type RecordEditContext} from './RecordEditContext'
    import EditRecord from './EditRecord.svelte'
    import type {RecordSearcher} from "./RecordSearcher";
    import type {RecordCreator} from "./RecordCreator";
    import type {DataRecord, ModelId, ModelView} from "@cozemble/model-core";

    export let recordEditContext: RecordEditContext
    export let recordSearcher: RecordSearcher
    export let modelViews: ModelView[]
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
        createNewRecord(modelId: ModelId): Promise<DataRecord | null> {
            return new Promise((resolve, reject) => {
                const newContext = createDependentRecordContext(recordEditContext, modelId, async (record) => {
                    const outcome = await recordEditContext.saveNewRecord(record);
                    if (outcome._type === "record.save.succeeded") {
                        popContext()
                        resolve(outcome.record)
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
                        {modelViews}
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
