<script lang="ts">
    import {getFilterablePaths} from "./filtering";
    import type {Model} from "@cozemble/model-core";
    import type {FilterActionHandler, FilterGroupList} from "@cozemble/data-filters";

    export let model: Model
    export let models: Model[]
    export let rootFilter: FilterGroupList
    export let filterActionHandler: FilterActionHandler

    const filterablePaths = getFilterablePaths(models, model)
</script>

<button class="btn btn-ghost btn-active">Add filter</button>