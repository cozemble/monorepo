<script lang="ts">
    import {onMount} from 'svelte';
    import {backend, setBackend} from "../../../../lib/backend/backendStore.js";
    import {cozauth} from "../../../../lib/auth/cozauth.js";
    import {LocalStorageBackend, RestBackend} from "@cozemble/frontend-bff";
    import {accessTokenProvider, backendUrlProvider} from "../../../../lib/backend/adapters.js";

    export let data: any;
    onMount(async () => {
        if (window) {
            if (data.env === 'localstorage') {
                console.log('Using localstorage backend')
                setBackend(new LocalStorageBackend())
            } else {
                console.log('Using rest backend')
                setBackend(new RestBackend(accessTokenProvider, backendUrlProvider))
            }

            await backend.tradeAuthTokenForSession(data.authorizationCode)
                .then(async (data:any) => {
                    const accessToken = data.accessToken;
                    const refreshToken = data.refreshToken;
                    if (accessToken && refreshToken) {
                        cozauth.setTokens('root', accessToken, refreshToken)
                        window.location.href = "/"
                    } else {
                        alert("Did not get tokens from cookie")
                    }
                    console.log(data)
                }).catch((err:any) => {
                    console.log(err)
                })
        }
    });
</script>