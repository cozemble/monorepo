<script lang="ts">
    import {getFilterablePaths} from "./filtering";
    import type {Model} from "@cozemble/model-core";

    export let model: Model
    export let models: Model[]

    const filterablePaths = getFilterablePaths(models, model)
</script>

<button class="btn btn-ghost btn-active">Add filter</button>