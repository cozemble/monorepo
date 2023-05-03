<script lang="ts">
    import {DataTable} from "@cozemble/frontend-datatable";
    import {eventSourcedModels} from "../models/modelsStore";
    import {modelViews, systemConfiguration} from "../models/tenantEntityStore";
    import {afterUpdate} from "svelte";

    afterUpdate(() => {
        console.log({models:$eventSourcedModels});
    });
</script>

<DataTable models={$eventSourcedModels} modelViews={$modelViews} systemConfiguration={$systemConfiguration} userId="test"/>