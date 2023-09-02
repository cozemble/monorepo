<script lang="ts">

    import type {Action} from "./ocrCorrectiveActions";
    import {strings} from "@cozemble/lang-util";

    export let item: Action

</script>
<div>
    {#if item.action === 'labelTable'}
        {strings.camelcaseToSentenceCase(item.action)} "{item.tableLabel}"
    {:else if item.action === 'mergeTables'}
        {strings.camelcaseToSentenceCase(item.action)} "{item.tableLabel}"
    {:else if item.action === 'extractRows'}
        {strings.camelcaseToSentenceCase(item.action)} from "{item.sourceTableLabel}" to "{item.targetTableLabel}"
    {:else if item.action === 'deleteRows'}
        {strings.camelcaseToSentenceCase(item.action)} from "{item.tableLabel}"
    {:else if item.action === 'dropColumns'}
        {strings.camelcaseToSentenceCase(item.action)} from "{item.tableLabel}"
    {:else}
        Apportion column "{item.sourceColumnName}" in "{item.tableLabel}"
    {/if}
</div>