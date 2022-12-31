<script lang="ts">
    import {
        registerAllProperties,
        registerAllPropertyConfigurers
    } from "@cozemble/model-assembled";
    import {onMount} from 'svelte'
    import PropertyEditor from "$lib/PropertyEditor.svelte";
    import {properties} from "@cozemble/model-core";

    let mounted = false
    onMount(() => {
        registerAllProperties()
        registerAllPropertyConfigurers()
        mounted = true
    })

    let property = properties.nullInstance()

</script>

{#if mounted}
    <PropertyEditor {property} />
{/if}
