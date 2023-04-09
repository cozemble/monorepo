<script lang="ts">
    import type {FilterInstance} from "@cozemble/data-filters-core";
    import type {FilterActionHandler} from "@cozemble/data-filters-core";
    import {filterActions} from "@cozemble/data-filters-core";
    import {filterInstanceFns} from "@cozemble/data-filters-core";

    export let filter: FilterInstance
    export let filterActionHandler: FilterActionHandler

    let initialValue = filterInstanceFns.getRhsValue(filter, {}) ?? ""

    function blurred(event:Event) {
        const target = event.target as HTMLInputElement
        filterActionHandler(filterActions.rhsChanged(filter.id, target.value))
    }
</script>

<input class="input input-bordered" type="text" value={initialValue} on:blur={blurred}/>

