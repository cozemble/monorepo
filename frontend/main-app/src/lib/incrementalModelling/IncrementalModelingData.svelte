<script lang="ts">
    import {DataTable} from "@cozemble/frontend-datatable";
    import {modelViews, systemConfiguration} from "../models/tenantEntityStore";
    import {eventSourcedModels} from "./incrementalModelStore";
</script>

<DataTable models={eventSourcedModels} modelViews={$modelViews} systemConfiguration={$systemConfiguration}
           userId="test"/>