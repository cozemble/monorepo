<script lang="ts">
    import {cozauth} from "../../../lib/auth/cozauth";
    import MainPanel from "../../../lib/MainPanel.svelte";
    import {onMount} from "svelte";
    import {
        registerAllProperties,
        registerAllPropertyEditors,
        registerAllPropertyViewers
    } from "@cozemble/model-assembled";
    import {page} from '$app/stores';


    onMount(() => {
        registerAllProperties()
        registerAllPropertyViewers()
        registerAllPropertyEditors()

    })
</script>

<div class="main-container">
    {#await cozauth.getSession('root')}
        <p>loading...</p>
    {:then session}
        {#if session}
            <MainPanel {session} tenantId={$page.params.tenantId}/>
        {:else }
            <h1>You need to login</h1>
        {/if}
    {:catch error}
        <p style="color: red">{error.message}</p>
    {/await}

</div>

<style>
    .main-container {
        height: 100%;
        width: 80%;
        margin: 0 auto;
    }
</style>