<script lang="ts">
    import {DataTable} from "@cozemble/frontend-datatable";
    import {modelViews, systemConfiguration} from "../models/tenantEntityStore";
    import {eventSourcedModels} from "./incrementalModelStore";
    import {writable} from "svelte/store";

    const writableModelViews = writable($modelViews)
</script>

<DataTable models={eventSourcedModels} modelViews={writableModelViews} systemConfiguration={$systemConfiguration}
           userId="test"/>