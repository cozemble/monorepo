<script lang="ts">
    import type {Model} from "@cozemble/model-core";
    import {numberOfDecimalPlacesChanged, type DecimalProperty} from "@cozemble/model-decimal-core";
    import { createEventDispatcher } from "svelte"

    export let model: Model
    export let property: DecimalProperty
    const dispatch = createEventDispatcher()

    const numberOfDecimalPlaceChanged = (event: Event) => {
        const target = event.target as HTMLInputElement
        dispatch('modelChanged', numberOfDecimalPlacesChanged(model.id, property.id, target.valueAsNumber))
    }

</script>

<div class="mt-3">
    <label class="label" for="decimal-number-label">Number of Decimal Places</label>
    <input type="number" class="input input-bordered" id="decimal-number-label" value={property.numberOfDecimalPlaces}
        on:change={numberOfDecimalPlaceChanged} />
</div>

