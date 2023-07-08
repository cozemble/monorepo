<script lang="ts">
    import type {JsonArrayProperty} from "@cozemble/model-properties-core";

    export let property: JsonArrayProperty
    export let value: any[] | null
    export let changeHandler: (value: any[] | null, submitEvent: KeyboardEvent | null) => void
    export let closeHandler: () => void
</script>

edit this array