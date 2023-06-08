<script lang="ts">
    import type {IntegerProperty} from "@cozemble/model-integer-core";

    export let value: number | null
    export let property: IntegerProperty
    export let changeHandler: (value: number | null, submitEvent: KeyboardEvent | null) => void

    function integerChanged(event: Event) {
        const target = event.target as HTMLInputElement
        const newValue = target.valueAsNumber
        changeHandler(newValue, null)
    }

    function validateInput(event: Event) {
        const target = event.target as HTMLInputElement;
        target.value = target.value.replace(/[^0-9]/g, '');
    }
</script>

<input
        class="input input-bordered"
        type="number"
        step="1"
        {value}
        on:input={validateInput}
        on:change={integerChanged}/>
