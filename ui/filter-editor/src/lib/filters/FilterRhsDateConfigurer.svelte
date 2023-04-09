<script lang="ts">
    import type {FilterInstance} from "@cozemble/data-filters-core";
    import type {FilterActionHandler} from "@cozemble/data-filters-core";
    import {filterActions} from "@cozemble/data-filters-core";
    import {filterInstanceFns} from "@cozemble/data-filters-core";
    import {uuids} from "@cozemble/lang-util";

    export let filter: FilterInstance
    export let filterActionHandler: FilterActionHandler
    const id = uuids.v4()

    let initialDate = filterInstanceFns.getRhsValue(filter, {}) ?? null

    function dateSelected(event:Event) {
        const target = event.target as HTMLInputElement
        const selectedDate = target.valueAsDate
        filterActionHandler(filterActions.rhsChanged(filter.id, selectedDate))
    }
</script>

<input class="input input-bordered" type="date" bind:value={initialDate} on:change={dateSelected} />

