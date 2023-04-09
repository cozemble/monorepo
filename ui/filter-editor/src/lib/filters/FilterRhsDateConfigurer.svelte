<script lang="ts">
    import type {FilterInstance} from "@cozemble/data-filters";
    import type {FilterActionHandler} from "@cozemble/data-filters";
    import {filterActions} from "@cozemble/data-filters";
    import {filterInstances} from "@cozemble/data-filters";
    import {uuids} from "@cozemble/lang-util";

    export let filter: FilterInstance
    export let filterActionHandler: FilterActionHandler
    const id = uuids.v4()

    let initialDate = filterInstances.getRhsValue(filter, {}) ?? null

    function dateSelected(event:Event) {
        const target = event.target as HTMLInputElement
        const selectedDate = target.valueAsDate
        filterActionHandler(filterActions.rhsChanged(filter.id, selectedDate))
    }
</script>

<input class="input input-bordered" type="date" bind:value={initialDate} on:change={dateSelected} />

