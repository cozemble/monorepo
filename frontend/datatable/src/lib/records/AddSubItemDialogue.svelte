<script lang="ts">

    import SubItemIntro from "./SubItemIntro.svelte";
    import AddSubItemSteps from "./AddSubItemSteps.svelte";
    import {introductionsState} from "../stores/introductions";

    export let showIntro = true

    function introFinished() {
        showIntro = false
        introductionsState.update(introductions => {
            introductions.subItemsIntroduction = "seen"
            return introductions
        })
    }
</script>

{#if showIntro}
    <SubItemIntro on:finished={introFinished}/>
{:else}
    <AddSubItemSteps on:addNestedRecord on:addNestedTable/>
{/if}
