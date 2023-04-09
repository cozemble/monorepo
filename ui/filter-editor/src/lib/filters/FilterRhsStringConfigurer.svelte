<script lang="ts">
    import type {FilterInstance} from "@cozemble/data-filters";
    import type {FilterActionHandler} from "@cozemble/data-filters";
    import {filterActions} from "@cozemble/data-filters";
    import {filterInstances} from "@cozemble/data-filters";

    export let filter: FilterInstance
    export let filterActionHandler: FilterActionHandler

    let initialValue = filterInstances.getRhsValue(filter, {}) ?? ""

    function blurred(event:Event) {
        const target = event.target as HTMLInputElement
        filterActionHandler(filterActions.rhsChanged(filter.id, target.value))
    }
</script>

<input class="input input-bordered" type="text" value={initialValue} on:blur={blurred}/>

