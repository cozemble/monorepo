<script lang="ts">
    import type {FilterActionHandler, FilterDataType, FilterInstance} from "@cozemble/data-filters-core";
    import {filterActions, userSuppliedRhsOptionWithValue} from "@cozemble/data-filters-core";
    import {createModelAndRecordForFiltering, type EverythingForFiltering} from "./filtering";
    import type {SystemConfiguration} from "@cozemble/model-core";
    import type {Readable} from "svelte/store";
    import {dataRecordEditorHost} from "@cozemble/data-editor-sdk";

    export let propertyType: FilterDataType
    export let systemConfiguration: Readable<SystemConfiguration>
    export let filter: FilterInstance
    export let filterActionHandler: FilterActionHandler

    const everything: EverythingForFiltering = createModelAndRecordForFiltering($systemConfiguration, propertyType, onValueProvided)

    dataRecordEditorHost.setClient(everything.editorClient)

    function onValueProvided(value: string) {
        console.log({value})
        filterActionHandler(filterActions.rhsChanged(filter.id, userSuppliedRhsOptionWithValue(value)))
    }
</script>
<svelte:component this={everything.editorComponent} record={everything.record} recordPath={everything.recordPath} inRecord={false}
                  systemConfiguration={$systemConfiguration}/>