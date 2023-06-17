<script lang="ts">
    import GenericStringEditor from "./GenericStringEditor.svelte";
    import type {JsonProperty} from "@cozemble/model-core";

    export let property: JsonProperty
    export let value: string | null
    export let changeHandler: (value: string | null, submitEvent: KeyboardEvent | null) => void
    export let closeHandler: () => void
</script>

<GenericStringEditor {value} multiline={property.configuration.multiline} {changeHandler} {closeHandler}/>
