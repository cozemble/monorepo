<script lang="ts">
    import {convertSchemaToModels, reconfigureApp} from "$lib/generative/components/helpers";
    import {propertyEssentials} from "../speech/schemas";
    import {goto} from "$app/navigation";
    import {onMount} from "svelte";



    onMount(() => {
        const converted = convertSchemaToModels(propertyEssentials)
        reconfigureApp(converted)
        goto("/amend")
    })
</script>