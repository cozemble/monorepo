<script lang="ts">
    import {createDependentRecordContext, type RecordEditContext} from './RecordEditContext'
    import EditRecord from './EditRecord.svelte'
    import type {RecordSearcher} from "./RecordSearcher";
    import type {RecordCreator} from "./RecordCreator";
    import type {DataRecord, ModelId, ModelView} from "@cozemble/model-core";

    export let recordEditContext: RecordEditContext
    export let recordSearcher: RecordSearcher
    export let modelViews: ModelView[]

    let stack: RecordEditContext[] = [recordEditContext]

    function visibleStackItem() {
        return stack[stack.length - 1]
    }

    function visibleStackItemIndex() {
        return stack.length - 1
    }

    function pushContext(context: RecordEditContext) {
        const current = visibleStackItem()
        context.prefixTitle(current.title + ' > ')

        stack = [...stack, context,]
        console.log(`Following push, visible stack item is ${visibleStackItem().id} with title ${visibleStackItem().title}`)
    }

    function popContext() {
        // take the last element off the stack
        stack = stack.slice(0, -1)
        console.log(`Following push, visible stack item is ${visibleStackItem().id} with title ${visibleStackItem().title}`)
    }

    const recordCreator: RecordCreator = {
        createNewRecord(modelId: ModelId): Promise<DataRecord | null> {
            console.log("createNewRecord", modelId)
            return new Promise((resolve, reject) => {
                const newContext = createDependentRecordContext(recordEditContext, modelId, async (record) => {
                    const outcome = await recordEditContext.saveNewRecord(record);
                    if (outcome._type === "record.save.succeeded") {
                        console.log(`Popping context in succsssful save`)
                        popContext()
                        resolve(outcome.record)
                    } else {
                        console.log(`Popping context in unsuccsssful save`)
                        popContext()
                        reject(outcome.errors.join(", "))
                    }
                    return outcome
                }, () => {
                    console.log(`Popping context in onCancel`)
                    popContext()
                    resolve(null)
                })
                pushContext(newContext)
            })
        }
    }
</script>

{#each stack as stackElement, index}
    {#key stackElement.id}
        <div class:hidden={visibleStackItemIndex() !== index}>
            <EditRecord recordEditContext={stackElement}
                        {recordSearcher}
                        {recordCreator}
                        {modelViews}
                        {pushContext}
                        {popContext}/>
        </div>
    {/key}
{/each}

<style>
    .hidden {
        display: none;
    }
</style>