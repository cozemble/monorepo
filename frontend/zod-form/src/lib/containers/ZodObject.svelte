<script lang="ts">
    import {z, type ZodIssue} from 'zod'
    import ZodEnum from "./ZodEnum.svelte";
    import ZodLiteral from "./ZodLiteral.svelte";
    import ZodPrimitive from "./ZodPrimitive.svelte";
    import {getContext} from "svelte";
    import ZodArray from "./ZodArray.svelte";
    import type {Path} from "$lib/containers/helper";
    import {errorComponentFinder, errorsAtPath} from "$lib/containers/helper";
    import WithDefaultsHandled from "$lib/containers/WithDefaultsHandled.svelte";
    import ZodDiscriminatedUnion from "$lib/containers/ZodDiscriminatedUnion.svelte";

    export let value: any
    export let schema: z.ZodObject<any>
    export let errors: ZodIssue[] = []
    export let showErrors: boolean
    export let path: Path = []

</script>

{#each Object.keys(schema.shape) as key}
    {@const givenField = schema.shape[key]}
    {@const extendedPath = [...path, key]}
    {@const extendedErrors = errorsAtPath(extendedPath, errors)}
    {@const errorComponent = errorComponentFinder(getContext)(extendedPath)}
    {#key key}
        <WithDefaultsHandled let:field {givenField} {key} bind:value>
            <div id={extendedPath.join('.')}>
                {#if field instanceof z.ZodEnum}
                    <ZodEnum {key} field={field} bind:value={value[key]} path={extendedPath}/>
                {:else if field instanceof z.ZodString}
                    <ZodPrimitive {key} field={field} bind:value={value[key]} path={extendedPath}/>
                {:else if field instanceof z.ZodArray}
                    <ZodArray {key} field={field} bind:value path={extendedPath} {errors} {showErrors}/>
                {:else if field instanceof z.ZodDiscriminatedUnion}
                    <ZodDiscriminatedUnion field={field} bind:value path={extendedPath} {errors} {showErrors}/>
                {:else if field instanceof z.ZodLiteral}
                    <ZodLiteral {key} field={field} bind:value={value[key]}/>
                {:else}
                    ZodObject to do : {key} as {field.constructor.name}
                {/if}
                <svelte:component this={errorComponent.component} {...errorComponent.props} {showErrors}
                                  errors={extendedErrors}/>
            </div>
        </WithDefaultsHandled>
    {/key}
{/each}