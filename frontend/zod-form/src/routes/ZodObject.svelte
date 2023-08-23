<script lang="ts">
    import {z, type ZodIssue} from 'zod'
    import ZodEnum from "./ZodEnum.svelte";
    import ZodLiteral from "./ZodLiteral.svelte";
    import ZodPrimitive from "./ZodPrimitive.svelte";
    import {errorComponentFinder, errorsAtPath} from "./helper";
    import {getContext} from "svelte";

    export let value: any
    export let schema: z.ZodObject<any>
    export let errors: ZodIssue[] = []
    export let showErrors: boolean
    export let path: string[] = []
</script>

{#each Object.keys(schema.shape) as key}
    {@const field = schema.shape[key]}
    {@const extendedPath = [...path, key]}
    {@const extendedErrors = errorsAtPath(extendedPath, errors)}
    {@const errorComponent = errorComponentFinder(getContext)(extendedPath)}
    {#if field instanceof z.ZodEnum}
        <ZodEnum {key} field={field} bind:value={value[key]} path={extendedPath}/>
    {:else if field instanceof z.ZodString}
        <ZodPrimitive {key} field={field} bind:value={value[key]} path={extendedPath}/>
    {:else if field instanceof z.ZodArray}
        Array
    {:else if field instanceof z.ZodLiteral}
        <ZodLiteral {key} field={field} bind:value={value[key]}/>
    {:else}
        To do : {field.constructor.name}
    {/if}
    <svelte:component this={errorComponent.component} {...errorComponent.props} {showErrors} errors={extendedErrors} />
{/each}