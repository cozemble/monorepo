<script lang="ts">
    import type {FilterAction} from "@cozemble/data-filters-core";
    import {partiallyAppliedFilterGroupListReducer} from "@cozemble/data-filters-core";
    import FilterManagement from "../../lib/filters/FilterManagement.svelte";
    import {rootGroupList, sampleLhsOptions} from "../instances/+server";

    let groupList = rootGroupList

    const reducer = partiallyAppliedFilterGroupListReducer(sampleLhsOptions)

    function filterActionHandler(action: FilterAction) {
        groupList = reducer(action, groupList)
    }
</script>

<div class="container">
    <div class="row">
        <div class="col">
            <h4 class="text-center">Define your query</h4>
            <FilterManagement rootGroupList={groupList} {filterActionHandler} allowGroups={false}/>
        </div>
    </div>
</div>

<style>
    .container {
        border-left: solid 1px;
    }
</style>
