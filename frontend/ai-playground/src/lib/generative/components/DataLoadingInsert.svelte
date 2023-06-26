<script lang="ts">
    import {appliedDataBatchIds, generatedDataBatches, modelStore, replicatedRecords} from "$lib/generative/stores";
    import type {GeneratedDataBatch} from "$lib/generative/generateData";
    import {modelRecordsContextFns} from "@cozemble/frontend-datatable";
    import {eventSourcedDataRecordFns} from "@cozemble/model-event-sourced";
    import type {EventSourcedRecordGraph} from "@cozemble/model-event-sourced";

    const graph = modelRecordsContextFns.getEventSourcedRecordGraph()

    function applyGeneratedDataBatches(batches: GeneratedDataBatch[]) {
        for (const batch of batches) {
            if (!$appliedDataBatchIds.includes(batch.id)) {
                $appliedDataBatchIds = [...$appliedDataBatchIds, batch.id]
                const models = $modelStore.models.map(model => model.model)
                batch.records.forEach(record => {
                    const eventSourcedRecord = eventSourcedDataRecordFns.fromRecord(models, record)
                    graph.update(g => {
                        // If g.records has at least one element, insert as second last, otherwise insert as the last
                        if (g.records.length > 0) {
                            return {
                                ...g,
                                records: [
                                    ...g.records.slice(0, g.records.length - 1), // elements before the last one
                                    eventSourcedRecord, // new record to insert
                                    g.records[g.records.length - 1] // last element
                                ],
                            }
                        } else {
                            return {
                                ...g,
                                records: [eventSourcedRecord]
                            }
                        }
                    })
                    console.log("Applying batch", {batch})
                })
            }
        }
    }

    function replicateRecords(graph: EventSourcedRecordGraph) {
        const currentRecords = graph.records.map(r => r.record)
        replicatedRecords.set(currentRecords)
    }

    $: applyGeneratedDataBatches($generatedDataBatches)
    $: replicateRecords($graph)
</script>