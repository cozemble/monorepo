<script lang="ts">
    export let value: string | null

    $: displayable = value ?? ''
</script>

{displayable}
