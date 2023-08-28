<script lang="ts">
    import type {FomSchema} from "../Fom";

    export let value: any
    export let key: any
    export let givenField: FomSchema

    function handleDefaults(): FomSchema {
        console.log({givenField, value, key})
        if (givenField.type === "default") {
            value[key] = givenField.value
            return givenField.innerSchema
        }
        return givenField
    }

    const field = handleDefaults()
</script>
<slot {field}></slot>
