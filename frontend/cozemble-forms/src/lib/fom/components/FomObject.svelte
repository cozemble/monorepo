<script lang="ts">
    import {getContext} from "svelte";
    import type {FomIssue, FomObject} from "../Fom";
    import WithDefaultsHandled from "./WithDefaultsHandled.svelte";
    import FomEnum from "./FomEnum.svelte";
    import FomPrimitive from "./FomPrimitive.svelte";
    import FomArray from "./FomArray.svelte";
    import FomDiscriminatedUnion from "./FomDiscriminatedUnion.svelte";
    import FomLiteral from "./FomLiteral.svelte";
    import {errorsAtPath} from "./errorsAtPath";
    import type {Path} from "./helper";
    import {errorComponentFinder} from "./helper";
    import FomBoolean from "$lib/fom/components/FomBoolean.svelte";
    import EnsureNestedObject from "$lib/fom/components/EnsureNestedObject.svelte";
    import InputLabel from "../../inputs/InputLabel.svelte";

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
                {:else if field.type === "text" || field.type === "number"}
                    <FomPrimitive {key} field={field} bind:value={value[key]} path={extendedPath}/>
                {:else if field.type === "boolean"}
                    <FomBoolean {key} field={field} bind:value={value[key]} path={extendedPath}/>
                {:else if field.type === "array"}
                    <FomArray {key} field={field} bind:value path={extendedPath} {errors} {showErrors}/>
                {:else if field.type === "discriminatedUnion"}
                    <EnsureNestedObject bind:value {key}>
                        <InputLabel {key}/>
                        <FomDiscriminatedUnion field={field} bind:value={value[key]} path={extendedPath} {errors}
                                               {showErrors}/>
                    </EnsureNestedObject>
                {:else if field.type === "literal"}
                    <FomLiteral {key} field={field} bind:value={value[key]}/>
                {:else if field.type === "optional"}
                    {#if field.innerSchema.type === "text"}
                        <FomPrimitive {key} field={field.innerSchema} bind:value={value[key]} path={extendedPath}/>
                    {:else}
                        FomObject to do : optional support for {key} as {field.innerSchema.type}
                    {/if}
                {:else}
                    FomObject to do : {key} as {field.type}
                {/if}
                <svelte:component this={errorComponent.component} {...errorComponent.props} {showErrors}
                                  errors={extendedErrors}/>
            </div>
        </WithDefaultsHandled>
    {/key}
{/each}