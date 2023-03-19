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

    function showOnlyVisibleStackItem() {
        const visibleIndex = stack.length - 1
        const stackContainers = document.querySelectorAll('.stack-container')
        console.log({stackContainers})
        stackContainers.forEach((stackContainer:Element, index:number) => {
            if (index === visibleIndex) {
                (stackContainer as HTMLElement).style.display = 'none'
            } else {
                (stackContainer as HTMLElement).style.display = 'block'
            }
        })
    }

    function pushContext(context: RecordEditContext) {
        const current = visibleStackItem()
        context.prefixTitle(current.title + ' > ')

        stack = [...stack, context]
        console.log(`Following push, visible stack item is ${visibleStackItem().id} with title ${visibleStackItem().title}`)
    }

    function popContext() {
        // take the last element off the stack
        stack = stack.slice(0, -1)
        console.log(`Following push, visible stack item is ${visibleStackItem().id} with title ${visibleStackItem().title}`)
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
                        {popContext}/>
        </div>
    {/key}
{/each}

<style>
    .hidden {
        display: none;
    }
</style>
