<script lang="ts">
    import {browser} from '$app/environment';
    import {onMount} from 'svelte';

    let currentEndpoint = 'prod';
    onMount(() => {
        if (browser) {
            currentEndpoint = localStorage.getItem('cozemble.config.endpoint') || 'prod'
        }
    })

    function setEndpoint(endpoint: string) {
        currentEndpoint = endpoint;
        localStorage.setItem('cozemble.config.endpoint', endpoint)
        console.log('endpoint', endpoint)
    }

    function goHome() {
        window.location.href = '/'
    }
</script>

<!--radio-->
<h4>Endpoint</h4>
<input type="radio" name="endpoint" value="prod" checked={currentEndpoint === "prod"}
       on:click={() => setEndpoint('prod')}/> Production
<input type="radio" name="endpoint" value="local" checked={currentEndpoint === "local"}
       on:click={() => setEndpoint('local')}/> Local

<br/>
<br/>
<button on:click={goHome}>Go Home</button>