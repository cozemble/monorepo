<script lang="ts">
    import type {DataRecordPath, DataRecordPathElement, Property} from "@cozemble/model-core";
    import {getMyErrors} from "$lib/getMyErrors";

    export let property: Property
    export let parentPath: DataRecordPathElement[]
    export let errors: Map<DataRecordPath, string[]>

    $: myErrors = getMyErrors(errors, parentPath, property)
</script>
{#if myErrors.length > 0}
    <hr/>
    <div class="error">
        {#each myErrors as error}
            <div>{error}</div>
        {/each}
    </div>
{/if}

<style>
    .error {
        color: red;
    }
</style>