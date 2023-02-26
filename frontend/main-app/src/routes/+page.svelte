<script lang="ts">

    import {cozauth} from "../lib/auth/cozauth";
    import {onMount} from "svelte";

    function loginWithGithub() {
        window.location.href = "/auth/v1/login?provider=github&userPool=root"
    }

    let mounted = true
    let hasSession = false

    onMount(async () => {
        const session = await cozauth.getSession('root')
        console.log("session", session)
        if (session) {
            hasSession = true
            if (session.user.tenants.length === 1) {
                window.location.href = "/tenants/" + session.user.tenants[0]
            } else if (session.user.tenants.length > 1) {
                window.location.href = "/tenants"
            } else {
                alert("You don't have any tenant. Please contact your administrator.")
            }
        }
    })
</script>

{#if mounted}
    <h1>Welcome friend</h1>
    <button on:click={loginWithGithub}>Login with Github</button>
    <br/>
{:else}
    <p>loading...</p>
{/if}
