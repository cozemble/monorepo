<script lang="ts">

    import {cozauth} from "../lib/auth/cozauth";

    function loginWithGithub() {
        window.location.href = "/auth/github/login"
    }
</script>

{#await cozauth.getSession()}
    <p>loading...</p>
{:then session}
    {#if session}
        <h1>Welcome to cozemble</h1>
        <p>Hi {session.user.email}!</p>
    {:else }
        <h1>Welcome friend</h1>
        <button on:click={loginWithGithub}>Login with Github</button>
        <br/>
    {/if}
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}