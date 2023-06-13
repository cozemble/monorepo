<script lang="ts">
    import type {StringProperty} from "@cozemble/model-string-core";
    import GenericStringEditor from "$lib/GenericStringEditor.svelte";

    export let value: string | null
    export let property: StringProperty
    export let changeHandler: (value: string | null, submitEvent: KeyboardEvent | null) => void
    export let closeHandler: () => void

</script>

<GenericStringEditor {value} multiline={property.multiline} {changeHandler} {closeHandler}/>

