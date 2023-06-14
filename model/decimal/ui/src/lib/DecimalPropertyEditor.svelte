<script lang="ts">
    import type {DecimalProperty} from "@cozemble/model-decimal-core";
    import GenericDecimalEditor from "$lib/GenericDecimalEditor.svelte";

    export let value: number | null
    export let property: DecimalProperty
    export let changeHandler: (value: number | null, submitEvent: KeyboardEvent | null) => void

</script>

<GenericDecimalEditor {value} numberOfDecimalPlaces={property.numberOfDecimalPlaces} {changeHandler}/>