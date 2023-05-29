<script lang="ts">
    import {cozauth} from "../../../lib/auth/cozauth";
    import {onMount} from "svelte";
    import {registerEverything,} from "@cozemble/model-assembled";
    import {page} from '$app/stores';
    import {tenantStore} from "../../../lib/tenant/tenantStore";
    import {tempRegisterDateFilters} from "./temp";
    import {browser} from '$app/environment';
    import IncrementalModelingMain from "../../../lib/incrementalModelling/IncrementalModelingMain.svelte";
    import {showDevConsole} from "../../../lib/config";
    import ShowDataModellingExplainer from "../../../lib/incrementalModelling/ShowDataModellingExplainer.svelte";

    let ui = 'milestone1'
    onMount(() => {
        registerEverything()
        tempRegisterDateFilters()
        if (browser) {
            ui = localStorage.getItem('cozemble.config.ui') || 'incremental-modeling'
            showDevConsole.set(localStorage.getItem('cozemble.config.showDevConsole') === 'true')
        }
    })

</script>

{#await cozauth.getSession('root')}
    <p>loading...</p>
{:then session}
    {#if session && $tenantStore}
        <ShowDataModellingExplainer>
            <IncrementalModelingMain tenantId={$page.params.tenantId}/>
        </ShowDataModellingExplainer>
    {:else }
        <h1>You need to login</h1>
    {/if}
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}

