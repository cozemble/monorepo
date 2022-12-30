<script lang="ts">
    import type {DataRecord} from "@cozemble/model-core";
    import {models} from "@cozemble/model-core";
    import {stringProperties, stringPropertyOptions} from "@cozemble/model-string-core";
    import {dataRecords} from "@cozemble/model-core";
    import PaginatedEditor from "$lib/PaginatedEditor.svelte";

    let model = models.newInstance("Customer",
        stringProperties.newInstance("First name", stringPropertyOptions.required),
        stringProperties.newInstance("Last name"),
        stringProperties.newInstance("Phone", stringPropertyOptions.unique, stringPropertyOptions.validation("^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$", "Must be a valid phone number")),
        stringProperties.newInstance("Email", stringPropertyOptions.unique, stringPropertyOptions.validation("^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$", "Must be a valid email address"))
    )
    let records: DataRecord[] = [
        dataRecords.random(model, {"First name":"Mike", "Last name":"Smith", "Phone":"555-555-5555", "Email":"mike@smith.com"}),
    ]
</script>
<PaginatedEditor {model} {records} />
