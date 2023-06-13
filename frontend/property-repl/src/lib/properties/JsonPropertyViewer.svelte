<script lang="ts">
    import type {JsonProperty} from "$lib/properties/JsonProperty";

    export let value: any | null
    export let property: JsonProperty

    $: displayable = value ?? ''
</script>

{displayable}
