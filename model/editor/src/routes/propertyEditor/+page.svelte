<script lang="ts">
    import {
        registerAllProperties,
        registerAllPropertyConfigurers
    } from "@cozemble/model-assembled";
    import {onMount} from 'svelte'
    import PropertyEditor from "$lib/PropertyEditor.svelte";
    import type {Property} from "@cozemble/model-core";

    let mounted = false
    onMount(() => {
        registerAllProperties()
        registerAllPropertyConfigurers()
        mounted = true
    })

    let property: Property = {
        _type: "",
        id: "1",
        name: ""
    }

</script>

{#if mounted}
    <PropertyEditor {property} />
{/if}
