<script lang="ts">
    import type {Model} from "@cozemble/model-core";
    import DataTable from "../lib/DataTable.svelte";
    import {eventSourcedStore} from "../lib/stores/EventSourcedStore";
    import {type TablesAction, tablesActionReducer} from "../lib/tables/actions";
    import type {JustErrorMessage} from "@cozemble/lang-util";

    async function saveTables(actions: TablesAction[], tables: Model[]): Promise<JustErrorMessage | null> {
        return null
    }

    const eventSourcedTables = eventSourcedStore(tablesActionReducer, saveTables, [] as Model[])
</script>

<DataTable tables={eventSourcedTables}/>