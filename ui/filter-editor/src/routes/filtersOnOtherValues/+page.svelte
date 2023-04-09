<script lang="ts">
    import FilterManagement from "../../lib/filters/FilterManagement.svelte";
    import {rootGroupList, sampleLhsOptions} from "../instances/+server";
    import {type FilterAction, partiallyAppliedFilterGroupListReducer} from "@cozemble/data-filters";

    let groupList = rootGroupList

    const reducer = partiallyAppliedFilterGroupListReducer(sampleLhsOptions)

    function filterActionHandler(action: FilterAction) {
        groupList = reducer(action, groupList)
        console.log({action, groupList})
    }
</script>

<h4>Define your query</h4>
<FilterManagement rootGroupList={groupList} {filterActionHandler} allowGroups={false}/>
