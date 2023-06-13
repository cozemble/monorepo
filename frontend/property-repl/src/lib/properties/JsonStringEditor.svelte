<script lang="ts">
    import type {JsonProperty} from "$lib/properties/JsonProperty";
    import {GenericStringEditor} from "@cozemble/model-string-ui";

    export let property: JsonProperty
    export let value: string | null
    export let changeHandler: (value: string | null, submitEvent: KeyboardEvent | null) => void
    export let closeHandler: () => void
</script>

<GenericStringEditor {value} multiline={property.configuration.multiline} {changeHandler} {closeHandler}/>
