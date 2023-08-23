<script lang="ts">
    import {z} from 'zod'

    export let value: any
    export let key: any
    export let givenField: z.ZodType

    function handleDefaults() {
        if(givenField instanceof z.ZodDefault) {
            value[key] = givenField._def.defaultValue()
            return givenField._def.innerType
        }
        return givenField
    }
    const field = handleDefaults()
</script>
<slot {field}></slot>
