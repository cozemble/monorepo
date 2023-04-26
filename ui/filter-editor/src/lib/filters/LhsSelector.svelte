<script lang="ts">
    import type {FilterInstance} from "@cozemble/data-filters-core";

    export let filter: FilterInstance
    export let lhsChanged: (event: Event, filter: FilterInstance) => void

    function changed(event: Event) {
        lhsChanged(event, filter)
    }
</script>

<select class="input input-bordered" on:change={changed}>
    <option value={null} selected={filter.selectedLhsOption === null}>-----</option>
    {#each filter.lhsOptions as lhsOption}
        <option value={lhsOption.id}
                selected={filter.selectedLhsOption?.id === lhsOption.id}>{lhsOption.label}</option>
    {/each}
</select>
