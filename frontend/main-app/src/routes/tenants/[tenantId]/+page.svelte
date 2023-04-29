<script lang="ts">
    import {cozauth} from "../../../lib/auth/cozauth";
    import MainPanel from "../../../lib/MainPanel.svelte";
    import {onMount} from "svelte";
    import {registerEverything,} from "@cozemble/model-assembled";
    import {page} from '$app/stores';
    import {tenantStore} from "../../../lib/tenant/tenantStore";
    import {tempRegisterDateFilters} from "./temp";

    onMount(() => {
        registerEverything()
        tempRegisterDateFilters()
    })

</script>

{#await cozauth.getSession('root')}
    <p>loading...</p>
{:then session}
    {#if session && $tenantStore}
        <MainPanel tenantId={$page.params.tenantId}/>
    {:else }
        <h1>You need to login</h1>
    {/if}
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}

