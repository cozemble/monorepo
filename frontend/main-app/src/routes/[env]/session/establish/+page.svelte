<script lang="ts">
    import {onMount} from 'svelte';
    import {LocalStorageBackend} from "../../../../lib/backend/LocalStorageBackend";
    import {RestBackend} from "../../../../lib/backend/RestBackend";
    import {backend, setBackend} from "../../../../lib/backend/backendStore";
    import {cozauth} from "../../../../lib/auth/cozauth";

    export let data: any;
    onMount(async () => {
        if (window) {
            if (data.env === 'localstorage') {
                console.log('Using localstorage backend')
                setBackend(new LocalStorageBackend())
            } else {
                console.log('Using rest backend')
                setBackend(new RestBackend())
            }

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