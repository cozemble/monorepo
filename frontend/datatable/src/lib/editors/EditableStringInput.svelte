<script lang="ts">
    import type {EditableValue} from "./editableValue";
    import type {Readable} from "svelte/store";

    export let value: EditableValue
    export let showErrors: Readable<boolean>
    export let placeholder = ""
    export let extraClasses = ""
    const valueStore = value.value
    const errors = value.errors
</script>

<input type="text" class="input input-bordered w-full {extraClasses}" {placeholder} bind:value={$valueStore}/>

{#if $showErrors && $errors.length > 0}
    <div class="text-error">{$errors[0]}</div>
{/if}
