<script lang="ts">
    import type {DataRecord} from "@cozemble/model-core";

    export let record: DataRecord
    export let text: string
    export let onClick: (e: MouseEvent, record: DataRecord) => void

    function clicked(event: MouseEvent) {
        if (onClick) {
            onClick(event, record)
        }
    }
</script>

<button class="btn btn-ghost btn-active btn-sm mr-2" on:click={clicked}>{text}</button>
