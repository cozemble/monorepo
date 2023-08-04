<script lang="ts">
    import {convertSchemaToModels, reconfigureApp} from "$lib/generative/components/helpers";
    import {deliveryNoteSchema} from "../speech/schemas";
    import {goto} from "$app/navigation";
    import {onMount} from "svelte";
    import {newGenerationSessionId} from "$lib/generative/stores";

    onMount(() => {
        const converted = convertSchemaToModels(deliveryNoteSchema)
        reconfigureApp(converted)
        newGenerationSessionId()
        goto("/amend")
    })
</script>