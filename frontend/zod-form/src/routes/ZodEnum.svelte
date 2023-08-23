<script lang="ts">
    import {z} from 'zod'

    export let key: string
    export let field: z.ZodEnum<any>
    export let value: any
    export let path: string[]

    const options = field.options
    const defaultValue = field.default
</script>
<p>{key} = {JSON.stringify(field)}</p>
<p>options = {JSON.stringify(options)}</p>
<p>default = {JSON.stringify(defaultValue)}</p>