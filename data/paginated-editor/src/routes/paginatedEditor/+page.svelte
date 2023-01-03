<script lang="ts">
    import type {DataRecord, Model} from "@cozemble/model-core";
    import PaginatedEditor from "$lib/PaginatedEditor.svelte";
    import {onMount} from "svelte";
    import {
        registerAllProperties,
        registerAllPropertyEditors,
        registerAllPropertyViewers
    } from "@cozemble/model-assembled";
    import {pageEditorLocalStorageKey} from "./context";
    import {modelFns, modelOptions} from "@cozemble/model-api";
    import {stringPropertyFns, stringPropertyOptions} from "@cozemble/model-string-core";

    let model: Model | null = null
    let records: DataRecord[] = []

    onMount(() => {
        registerAllProperties()
        registerAllPropertyViewers()
        registerAllPropertyEditors()
        const item = localStorage.getItem(pageEditorLocalStorageKey)
        if (item) {
            model = JSON.parse(item)
            console.log("Loaded model from local storage", model)
        } else {
            model = modelFns.newInstance("Customer",
                modelOptions.withProperties(
                    stringPropertyFns.newInstance("First name", stringPropertyOptions.required),
                    stringPropertyFns.newInstance("Last name"),
                    stringPropertyFns.newInstance("Phone", stringPropertyOptions.unique, stringPropertyOptions.validation("^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$", "Must be a valid phone number")),
                    stringPropertyFns.newInstance("Email", stringPropertyOptions.unique, stringPropertyOptions.validation("^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$", "Must be a valid email address")))
            )
        }
    })
</script>
{#if model}
    <PaginatedEditor {model} {records}/>
{/if}
