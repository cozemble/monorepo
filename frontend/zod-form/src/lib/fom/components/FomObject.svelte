<script lang="ts">
    import {getContext} from "svelte";
    import type {Path} from "$lib/containers/helper";
    import {errorComponentFinder} from "$lib/containers/helper";
    import type {FomObject, FomIssue} from "$lib/fom/Fom";
    import WithDefaultsHandled from "./WithDefaultsHandled.svelte";
    import FomEnum from "$lib/fom/components/FomEnum.svelte";
    import FomPrimitive from "$lib/fom/components/FomPrimitive.svelte";
    import FomArray from "$lib/fom/components/FomArray.svelte";
    import FomDiscriminatedUnion from "$lib/fom/components/FomDiscriminatedUnion.svelte";
    import FomLiteral from "$lib/fom/components/FomLiteral.svelte";
    import {errorsAtPath} from "$lib/fom/components/errorsAtPath";

    export let value: any
    export let schema: FomObject
    export let errors: FomIssue[]
    export let showErrors: boolean
    export let path: Path = []

</script>

{#each Object.keys(schema.properties) as key}
    {@const givenField = schema.properties[key]}
    {@const extendedPath = [...path, key]}
    {@const extendedErrors = errorsAtPath(extendedPath, errors)}
    {@const errorComponent = errorComponentFinder(getContext)(extendedPath)}
    {#key key}
        <WithDefaultsHandled let:field {givenField} {key} bind:value>
            <div id={extendedPath.join('.')}>
                {#if field.type === "enum"}
                    <FomEnum {key} field={field} bind:value={value[key]} path={extendedPath}/>
                {:else if field.type === "text"}
                    <FomPrimitive {key} field={field} bind:value={value[key]} path={extendedPath}/>
                {:else if field.type === "array"}
                    <FomArray {key} field={field} bind:value path={extendedPath} {errors} {showErrors}/>
                {:else if field.type === "discriminatedUnion"}
                    <FomDiscriminatedUnion field={field} bind:value path={extendedPath} {errors} {showErrors}/>
                {:else if field.type === "literal"}
                    <FomLiteral {key} field={field} bind:value={value[key]}/>
                {:else}
                    FomObject to do : {key} as {field.type}
                {/if}
                <svelte:component this={errorComponent.component} {...errorComponent.props} {showErrors}
                                  errors={extendedErrors}/>
            </div>
        </WithDefaultsHandled>
    {/key}
{/each}