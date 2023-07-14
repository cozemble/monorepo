<script lang="ts">
    import GenericDecimalEditor from "./GenericDecimalEditor.svelte";
    import JsonIntegerEditor from "$lib/properties/number/JsonIntegerEditor.svelte";
    import type {NumberPropertyConfiguration} from "@cozemble/model-properties-core";
    import type {ChangeHandler} from "$lib";

    export let configuration: NumberPropertyConfiguration
    export let value: number | null
    export let changeHandler: ChangeHandler<number>

    $: decimalPlaces = configuration?.decimalPlaces ?? 0
</script>

{#if decimalPlaces === 0}
    <JsonIntegerEditor {value} {changeHandler}/>
{:else}
    <GenericDecimalEditor {value} numberOfDecimalPlaces={decimalPlaces} {changeHandler}/>
{/if}
