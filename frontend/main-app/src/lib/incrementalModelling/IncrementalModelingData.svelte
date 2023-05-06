<script lang="ts">
    import {DataTable, type DataTableBackend, RecordFilteringPanel} from "@cozemble/frontend-datatable";
    import {mergeTenantEntities, modelViews, systemConfiguration, type TenantEntity} from "../models/tenantEntityStore";
    import {eventSourcedModels, permitModelling} from "./incrementalModelStore";
    import {writable} from "svelte/store";
    import type {ModelView} from "@cozemble/model-core";
    import {onDestroy} from "svelte";
    import {toastNoticeStoreFns} from "../notices/toastNoticeStore";
    import {arrays} from "@cozemble/lang-util";
    import {showDevConsole} from "../config";

    const writableModelViews = writable($modelViews)
    export let dataTableBackend: DataTableBackend

    let lastSavedModelViews: ModelView[] | null = null
    const unsubModelViews = writableModelViews.subscribe((modelViews) => {
        if (lastSavedModelViews !== null) {
            const {leftOnly} = arrays.compare(modelViews, lastSavedModelViews, JSON.stringify)
            saveModelViews(leftOnly)
        }
        lastSavedModelViews = modelViews
    })

    async function saveModelViews(views: ModelView[]) {
        const saveOutcomes = await Promise.all(views.map(v => dataTableBackend.saveModelView(v)))
        const firstError = saveOutcomes.find(o => o !== null)
        if (firstError) {
            toastNoticeStoreFns.add(firstError.message, "error")
        } else {
            mergeTenantEntities(views as TenantEntity[])
        }
    }


    onDestroy(() => {
        unsubModelViews()
    })
</script>

<DataTable models={eventSourcedModels}
           modelViews={writableModelViews}
           systemConfiguration={$systemConfiguration}
           {permitModelling}
           {showDevConsole}
           userId="test"
           recordFilteringComponent={RecordFilteringPanel}/>