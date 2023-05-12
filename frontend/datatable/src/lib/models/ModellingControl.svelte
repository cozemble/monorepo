<script lang="ts">
    import {contextHelper} from "../stores/contextHelper";

    const globalModellingPermission = contextHelper.getPermitModelling()
    export let permitModelling: boolean
</script>
{#if $globalModellingPermission && permitModelling}
    <slot></slot>
{/if}