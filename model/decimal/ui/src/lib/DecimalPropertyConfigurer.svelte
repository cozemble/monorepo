<script lang="ts">
    import type {Model} from "@cozemble/model-core";
    import type {DecimalProperty} from "@cozemble/model-decimal-core";

    export let model: Model
    export let property: DecimalProperty

</script>

<div class="mt-3">
    <label class="label">Number of Decimal Places</label>
    <input type="number" class="input input-bordered" value={property.numberOfDecimalPlaces} />
</div>

