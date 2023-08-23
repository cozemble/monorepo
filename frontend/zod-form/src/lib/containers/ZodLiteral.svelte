<script lang="ts">
    import {z} from 'zod'
    export let key:string
    export let field:z.ZodLiteral<any>
    export let value:any

    value = field.value
</script>
