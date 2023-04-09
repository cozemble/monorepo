<script lang="ts">
    import type {FilterGroup} from "@cozemble/data-filters-core";
    import FilterGroupListView from "./FilterGroupListView.svelte";
    import FilterInstanceListView from "./FilterInstanceListView.svelte";
    import type {FilterActionHandler} from "@cozemble/data-filters-core";

    export let group: FilterGroup
    export let filterActionHandler: FilterActionHandler
    export let allowGroups: boolean
    export let filterAlias:string

</script>

{#if group.contents._type === "filter.group.list"}
    <div class="ml-5 p-1">
        <FilterGroupListView list={group.contents} {filterActionHandler} {allowGroups} {filterAlias}/>
    </div>
{:else if group.contents._type === "filter.instance.list"}
    <FilterInstanceListView list={group.contents} {filterActionHandler} {allowGroups} {filterAlias}/>
{:else}
    Don't know how to deal with contents of type {JSON.stringify(group)}
{/if}