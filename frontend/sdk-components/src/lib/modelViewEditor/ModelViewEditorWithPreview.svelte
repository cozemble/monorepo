<script lang="ts">

    import ModelViewEditor from "./ModelViewEditor.svelte";
    import ModelViewPreview from "./ModelViewPreview.svelte";
    import type {DataRecord, Model, ModelView} from "@cozemble/model-core";
    import type {Writable} from "svelte/store";

    export let modelView: Writable<ModelView>
    export let models: Model[]
    export let sampleRecords: DataRecord[]


</script>

<div class="flex">
    <div>
        <ModelViewEditor {modelView} {models}/>
    </div>
    <div class="ml-3">
        <ModelViewPreview {models} {modelView} {sampleRecords}/>
    </div>
</div>
