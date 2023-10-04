<script lang="ts">
    import type {TableAction} from "./wizardState";
    import MergeTables from "./MergeTables.svelte";
    import type {Action} from "../ocr-as-html/ocrCorrectiveActions";
    import type {Writable} from "svelte/store";

    export let action: TableAction
    export let correctiveActions: Writable<Action[]>
</script>

{#if action === 'mergeTables'}
    <MergeTables {correctiveActions}/>
{:else if action === 'deleteRows'}
    Delete Rows
{:else}
    Extract rows
{/if}