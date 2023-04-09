<script lang="ts">
    import FilterGroupListView from "./FilterGroupListView.svelte";
    import type {FilterActionHandler, FilterGroupList} from "@cozemble/data-filters-core";
    import {filterActions} from "@cozemble/data-filters-core";

    export let rootGroupList: FilterGroupList
    export let filterActionHandler: FilterActionHandler
    export let allowGroups = true
    export let filterAlias = "filter"
</script>
<FilterGroupListView list={rootGroupList} {filterActionHandler} {allowGroups} {filterAlias}/>
{#if rootGroupList.groups.length > 1}
    <div class="mt-2">
        <button class="btn btn-ghost btn-active"
                on:click={() => filterActionHandler(filterActions.addGroup(rootGroupList.id))}>Add group
        </button>
    </div>
{/if}
