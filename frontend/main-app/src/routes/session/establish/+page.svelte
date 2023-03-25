<script lang="ts">
    import {onMount} from 'svelte';
    import {config} from "../../../lib/config";
    import {cozauth} from "../../../lib/auth/cozauth";

    export let data: any;

    console.log(data.authorizationCode)

    onMount(async () => {
        if(window) {
            await fetch(`${config.backendUrl()}/api/v1/auth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    authorizationToken: data.authorizationCode
                })
            }).then(async (res) => {
                if(!res.ok) throw new Error("Did not get access tokens")
                const data = await res.json();
                const accessToken = data.accessToken;
                const refreshToken = data.refreshToken;
                if (accessToken && refreshToken) {
                    cozauth.setTokens('root', accessToken, refreshToken)
                    window.location.href = "/"
                } else {
                    alert("Did not get tokens from cookie")
                }
                console.log(data);
            }).catch((err) => {
                console.log(err);
            })
        }
    });


</script>