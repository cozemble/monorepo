<script lang="ts">
    import type {FilterDataType} from "@cozemble/data-filters-core";
    import {createModelAndRecordForFiltering, type EverythingForFiltering} from "./filtering";
    import type {SystemConfiguration} from "@cozemble/model-core";
    import type {Readable} from "svelte/store";
    import {dataRecordEditorHost} from "@cozemble/data-editor-sdk";

    export let propertyType: FilterDataType
    export let systemConfiguration: Readable<SystemConfiguration>
    const everything: EverythingForFiltering = createModelAndRecordForFiltering($systemConfiguration, propertyType,onValueProvided)

    dataRecordEditorHost.setClient(everything.editorClient)

    function onValueProvided(event:CustomEvent) {
        console.log({event})
    }
</script>
<svelte:component this={everything.editorComponent} record={everything.record} recordPath={everything.recordPath} systemConfiguration={$systemConfiguration} />