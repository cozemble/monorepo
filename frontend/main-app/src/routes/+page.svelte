<script lang="ts">

    import {cozauth} from "../lib/auth/cozauth";
    import {onMount} from "svelte";
    import {config} from "../lib/config";

    function loginWithGithub() {
        const rootUrl = encodeURIComponent(`${window.location.protocol}//${window.location.host}`);
        window.location.href = `${config.backendUrl()}/api/v1/auth/login?provider=github&userPool=root&cozembleRoot=${rootUrl}`
    }

    let mounted = true
    let hasSession = false

    onMount(async () => {
        const session = await cozauth.getSession('root')
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
    <button class="btn" on:click={loginWithGithub}>Login with Github</button>
    <br/>
{:else}
    <p>loading...</p>
{/if}
