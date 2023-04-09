<script lang="ts">
    import type {FilterActionHandler, FilterGroup, FilterGroupList} from "@cozemble/data-filters";
    import {filterActions} from "@cozemble/data-filters";
    import FilterGroupView from "./FilterGroupView.svelte";
    import ConjunctionView from "./ConjunctionView.svelte";

    export let list: FilterGroupList
    export let filterActionHandler: FilterActionHandler
    export let allowGroups: boolean
    export let filterAlias: string

    function conjunctionChanged(event: CustomEvent) {
        filterActionHandler(filterActions.filterGroupListConjunctionChanged(list.id, event.detail.conjunction))
    }

    function deleteGroup(group: FilterGroup) {
        filterActionHandler(filterActions.deleteFilterGroup(list.id, group.id))
    }
</script>

{#each list.groups as group, groupIndex}
    {@const isLast = groupIndex === list.groups.length - 1}
    {#if list.groups.length > 1}
        <div class="mt-2 mb-2 ml-5 mr-5 border p-1">
            <div class="flex justify-content-end">
                <button class="btn btn-ghost btn-active btn-xs" title="Delete this group"
                        on:click={() => deleteGroup(group)}></button>
            </div>
            <div class="p-2">
                <FilterGroupView {group} {filterActionHandler} {allowGroups} {filterAlias}/>
            </div>
        </div>
    {:else}
        <FilterGroupView {group} {filterActionHandler} {allowGroups} {filterAlias}/>
    {/if}
    {#if !isLast}
        <div class="mt-2 flex">
            <ConjunctionView conjunction={list.conjunction}
                             on:conjunctionChanged={conjunctionChanged}/>
        </div>
    {/if}
{/each}