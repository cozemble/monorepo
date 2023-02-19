<script lang="ts">

    import {cozauth} from "../lib/auth/cozauth";
    import MainPanel from "../lib/MainPanel.svelte";

    function loginWithGithub() {
        window.location.href = "/auth/v1/login?provider=github&userPool=root"
    }
</script>

{#await cozauth.getSession('root')}
    <p>loading...</p>
{:then session}
    {#if session}
        <MainPanel {session}/>
    {:else }
        <h1>Welcome friend</h1>
        <button on:click={loginWithGithub}>Login with Github</button>
        <br/>
    {/if}
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}