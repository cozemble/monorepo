<script lang="ts">
    import {cozauth} from "../../../lib/auth/cozauth";
    import MainPanel from "../../../lib/MainPanel.svelte";
    import {onMount} from "svelte";
    import {registerEverything,} from "@cozemble/model-assembled";
    import {page} from '$app/stores';
    import {tenantStore} from "../../../lib/tenant/tenantStore";
    import {tempRegisterDateFilters} from "./temp";
    import {browser} from '$app/environment';
    import IncrementalModelingMain from "../../../lib/incrementalModelling/IncrementalModelingMain.svelte";
    import {showDevConsole} from "../../../lib/config";

    let ui = 'milestone1'
    onMount(() => {
        registerEverything()
        tempRegisterDateFilters()
        if (browser) {
            ui = localStorage.getItem('cozemble.config.ui') || 'milestone1'
            showDevConsole.set(localStorage.getItem('cozemble.config.showDevConsole') === 'true')
        }
    })

</script>

{#await cozauth.getSession('root')}
    <p>loading...</p>
{:then session}
    {#if session && $tenantStore}
        {#if ui === 'incremental-modeling'}
            <IncrementalModelingMain tenantId={$page.params.tenantId}/>
        {:else}
            <MainPanel tenantId={$page.params.tenantId}/>
        {/if}
    {:else }
        <h1>You need to login</h1>
    {/if}
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}

