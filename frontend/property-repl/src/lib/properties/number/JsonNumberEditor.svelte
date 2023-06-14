<script lang="ts">
    import type {JsonProperty} from "@cozemble/model-core";
    import {GenericDecimalEditor} from "@cozemble/model-decimal-ui";

    export let property: JsonProperty
    export let value: number | null
    export let changeHandler: (value: number | null, submitEvent: KeyboardEvent | null) => void
</script>

<GenericDecimalEditor {value} numberOfDecimalPlaces={property.configuration.decimalPlaces} {changeHandler}/>
