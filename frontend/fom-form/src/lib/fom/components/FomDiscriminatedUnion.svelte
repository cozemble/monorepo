<script lang="ts">
    import {strings} from "@cozemble/lang-util";
    import type {FomDiscriminatedUnion, FomIssue} from "$lib/fom/Fom";
    import FomObject from "$lib/fom/components/FomObject.svelte";
    import type {Path} from "./helper";

    export let field: FomDiscriminatedUnion
    export let value: any
    export let path: Path
    export let errors: FomIssue[]
    export let showErrors: boolean

    const discriminatorField = field.discriminator
    const schemas = field.options
    const keys = schemas.map(schema => {
        if(schema.type === 'object') {
            const discriminatorValue = schema.properties[discriminatorField];
            if (discriminatorValue.type === 'literal') {
                return discriminatorValue.value
            }
            throw new Error('Discriminator field must be a literal')
        }
        throw new Error('Discriminated unions mush contain objects, for now')
    })

    $: selectedSchema = schemas.find(schema => {
        if(schema.type === 'object') {
            const field = schema.properties[discriminatorField];
            if(field.type === 'literal') {
                return field.value === value[discriminatorField]
            }
        }
        return null
    })
</script>

<select class="input input-bordered" bind:value={value[discriminatorField]} >
    <option>-----</option>
    {#each keys as key}
        <option value={key} selected={key === value[discriminatorField]}>{strings.camelcaseToSentenceCase(key)}</option>
    {/each}
</select>

{#if selectedSchema}
    {#if selectedSchema.type === "object"}
        <FomObject bind:value schema={selectedSchema} {errors} {showErrors} {path}/>
    {:else}
        FomDiscriminatedUnion: to do {selectedSchema.type}
    {/if}
{/if}
