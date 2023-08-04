<script lang="ts">
    import {editorExtensions} from "$lib";

    const switchable = editorExtensions.getSwitchableModelPane()
</script>
{#if $switchable}
    <svelte:component this={$switchable.component} {...$switchable.props}/>
{:else}
    <slot></slot>
{/if}
