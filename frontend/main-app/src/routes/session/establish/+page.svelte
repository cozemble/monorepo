<script lang="ts">
    import {onMount} from 'svelte';
    import {cozauth} from "../../../lib/auth/cozauth";
    import {backend} from "../../../lib/backend/backendStore";

    export let data: any;
    onMount(async () => {
        if (window) {
            await backend.tradeAuthTokenForSession(data.authorizationCode)
                .then(async (data) => {
                    const accessToken = data.accessToken;
                    const refreshToken = data.refreshToken;
                    if (accessToken && refreshToken) {
                        cozauth.setTokens('root', accessToken, refreshToken)
                        window.location.href = "/"
                    } else {
                        alert("Did not get tokens from cookie")
                    }
                    console.log(data)
                }).catch((err) => {
                    console.log(err)
                })
        }
    });
</script>