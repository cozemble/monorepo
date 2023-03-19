<script lang="ts">
    import type {RecordEditContext} from './RecordEditContext'
    import EditRecord from './EditRecord.svelte'
    import type {RecordSearcher} from "./RecordSearcher";
    import type {ModelView} from "@cozemble/model-core";

    export let recordEditContext: RecordEditContext
    export let recordSearcher: RecordSearcher
    export let modelViews: ModelView[]

    let stack: RecordEditContext[] = [recordEditContext]

    function pushContext(context: RecordEditContext) {
        const current = stack[0]
        context.prefixTitle(current.title + ' > ')

        stack = [context, ...stack]
    }

    function popContext() {
        const [_head, ...tail] = stack
        stack = tail
    }
</script>

{#key stack[0].id}
    <EditRecord recordEditContext={stack[0]} {recordSearcher} {modelViews} {pushContext} {popContext}/>
{/key}
