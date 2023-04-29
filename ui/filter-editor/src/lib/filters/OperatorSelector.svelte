<script lang="ts">
    import type {FilterInstance} from "@cozemble/data-filters-core";

    export let filter: FilterInstance
    export let operatorChanged: (changeEvent: Event, filter: FilterInstance) => void

    function onChange(event: Event) {
        operatorChanged(event, filter)
    }
</script>

{#if filter.selectedLhsOption}
    <select class="input input-bordered" on:change={onChange}>
        <option value={null} selected={filter.selectedOperatorOption === null}>-----</option>
        {#each filter.selectedLhsOption.operators as operator}
            <option value={operator.id}
                    selected={filter.selectedOperatorOption?.id === operator.id}>{operator.label}</option>
        {/each}
    </select>
{/if}