<script lang="ts">
    import type {Model} from "@cozemble/model-core";
    import {FilterManagement} from "@cozemble/ui-filter-editor";
    import type {FilterActionHandler, FilterGroupList} from "@cozemble/data-filters-core";

    export let model: Model
    export let models: Model[]
    export let rootFilter: FilterGroupList
    export let filterActionHandler: FilterActionHandler
</script>

<FilterManagement rootGroupList={rootFilter} {filterActionHandler} allowGroups={false} filterAlias="Condition"/>