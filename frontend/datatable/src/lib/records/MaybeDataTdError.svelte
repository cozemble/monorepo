<script lang="ts">
    import type {RecordErrorMap} from "./helpers";
    import {firstRecordError} from "./helpers";
    import type {DataRecordPathParentElement, LeafModelSlot} from "@cozemble/model-core";
    import {dataRecordValuePathFns} from "@cozemble/model-api";
    import {singleRecordEditContext} from "./contextHelper";

    const visibility = singleRecordEditContext.getErrorVisibilityForRecord()
    export let errors: RecordErrorMap
    export let modelSlot: LeafModelSlot
    export let parentPath: DataRecordPathParentElement[]
    const path = dataRecordValuePathFns.newInstance(modelSlot, ...parentPath)
    $: maybeError = firstRecordError(errors, path)

</script>
{#if maybeError && $visibility}
    <div class="border border-error w-full error-div text-center text-error">
        {maybeError}
    </div>
{/if}

<style>
    .error-div {
        border-bottom: 0;
        border-left: 0;
        border-right: 0;
    }
</style>