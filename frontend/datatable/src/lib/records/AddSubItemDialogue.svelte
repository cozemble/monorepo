<script lang="ts">

    import SubItemIntro from "./SubItemIntro.svelte";
    import AddSubItemSteps from "./AddSubItemSteps.svelte";

    export let showIntro = true

    function introFinished() {
        showIntro = false
        console.log({showIntro})
    }

</script>
{#if showIntro}
    <SubItemIntro on:finished={introFinished}/>
{:else}
    <AddSubItemSteps />
{/if}
