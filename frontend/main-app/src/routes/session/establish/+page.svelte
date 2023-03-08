<script lang="ts">
    import {onMount} from "svelte";
    import {cozauth} from "../../../lib/auth/cozauth";
    import {accessTokenKey, refreshTokenKey} from "@cozemble/backend-tenanted-api-types";

    onMount(() => {
        if (window) {
            // eslint-disable-next-line no-inner-declarations
            function getCookie(name:string) {
                const nameEQ = name + "=";
                const ca = document.cookie.split(';')
                for (let i = 0; i < ca.length; i++) {
                    let c = ca[i];
                    while (c.charAt(0) == ' ') {
                        c = c.substring(1, c.length)
                    }
                    if (c.indexOf(nameEQ) == 0) {
                        return c.substring(nameEQ.length, c.length)
                    }
                }
                return null;
            }

            const accessToken = getCookie(accessTokenKey('root'))
            const refreshToken = getCookie(refreshTokenKey('root'))
            console.log({accessToken, refreshToken, accessTokenKey:accessTokenKey('root'), refreshTokenKey:refreshTokenKey('root')})
            if (accessToken && refreshToken) {
                cozauth.setTokens('root', accessToken, refreshToken)
                window.location.href = "/"
            } else {
                alert("Did not get tokens from cookie")
            }
        }
    })
</script>