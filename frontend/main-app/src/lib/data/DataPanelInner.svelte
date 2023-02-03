<script lang="ts">
    import type {DataRecord, Model} from "@cozemble/model-core";
    import type {PaginatedEditorHost} from "@cozemble/data-paginated-editor";
    import {PaginatedEditor} from "@cozemble/data-paginated-editor";

    export let models: Model[]
    export let model: Model
    export let records: DataRecord[]
    export let paginatedEditorHost: PaginatedEditorHost

</script>
<PaginatedEditor {models} {model} {records} {paginatedEditorHost}/>