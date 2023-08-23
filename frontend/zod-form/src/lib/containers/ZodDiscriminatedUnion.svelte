<script lang="ts">
    import {z, type ZodIssue} from 'zod'
    import type {Path} from "./helper";
    import ZodObject from "$lib/containers/ZodObject.svelte";
    import {strings} from "@cozemble/lang-util";

    export let field: z.ZodDiscriminatedUnion<any, any>
    export let value: any
    export let path: Path
    export let errors: ZodIssue[] = []
    export let showErrors: boolean

    const discriminatorField = field._def.discriminator
    const schemas = field._def.options
    const keys = schemas.map(schema => {
        const discriminatorValue = schema.shape[discriminatorField];
        if (discriminatorValue instanceof z.ZodLiteral) {
            return discriminatorValue.value
        }
        throw new Error('Discriminator field must be a literal')
    })

    $: selectedSchema = schemas.find(schema => schema.shape[discriminatorField].value === value[discriminatorField])
</script>

<select class="input input-bordered" bind:value={value[discriminatorField]} >
    <option>-----</option>
    {#each keys as key}
        <option value={key} selected={key === value[discriminatorField]}>{strings.camelcaseToSentenceCase(key)}</option>
    {/each}
</select>

{#if selectedSchema}
    {#if selectedSchema instanceof z.ZodObject}
        <ZodObject bind:value schema={selectedSchema} {errors} {showErrors} {path}/>
    {:else}
        ZodDiscriminatedUnion: to do {selectedSchema.constructor.name}
    {/if}
{/if}
