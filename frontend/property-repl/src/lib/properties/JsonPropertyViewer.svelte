<script lang="ts">

    export let value: any | null

    $: displayable = value ?? ''
</script>

{displayable}
