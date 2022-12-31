<script lang="ts">
    import {
        registerAllProperties,
        registerAllPropertyConfigurers
    } from "@cozemble/model-assembled";
    import {onMount} from 'svelte'
    import PropertyEditor from "$lib/PropertyEditor.svelte";
    import {propertyFns} from "@cozemble/model-api";

    let mounted = false
    onMount(() => {
        registerAllProperties()
        registerAllPropertyConfigurers()
        mounted = true
    })

    let property = propertyFns.newInstance()

</script>

{#if mounted}
    <PropertyEditor {property} />
{/if}
