<script lang="ts">
    import type {Model} from "@cozemble/model-core";
    import type {DecimalProperty} from "@cozemble/model-decimal-core";

    export let model: Model
    export let property: DecimalProperty

</script>

<input type="number" value={property.numberOfDecimalPlaces} />

