<script lang="ts">
    import {cozauth} from "../../../lib/auth/cozauth";
    import MainPanel from "../../../lib/MainPanel.svelte";
    import type {PageData} from './$types'
    import {backendTenant} from "../../../lib/tenants/tenantStore";
    import {afterUpdate} from "svelte";
    import {modelBeingEdited} from "../../../lib/models/modelsStore";

    export let data: PageData

    afterUpdate(() => {
        console.log({tenant: $backendTenant, modelBeingEdited: $modelBeingEdited})
    })
</script>

{#await cozauth.getSession('root')}
    <p>loading...</p>
{:then session}
    {#if session}
        <MainPanel {session}/>
    {:else }
        <h1>You need to login</h1>
    {/if}
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}
