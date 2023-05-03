<script lang="ts">
    import {browser} from '$app/environment';
    import {onMount} from 'svelte';

    let currentEndpoint = 'prod';
    let currentUi = 'milestone1';
    const endpointConfigItemName = 'cozemble.config.endpoint';
    const uiConfigItemName = 'cozemble.config.ui';
    onMount(() => {
        if (browser) {
            currentEndpoint = localStorage.getItem(endpointConfigItemName) || 'prod'
            currentUi = localStorage.getItem(uiConfigItemName) || 'milestone1'
        }
    })

    function setEndpoint(endpoint: string) {
        currentEndpoint = endpoint;
        localStorage.setItem(endpointConfigItemName, endpoint)
    }

    function setUi(value: string) {
        currentUi = value;
        localStorage.setItem(uiConfigItemName, currentUi)
    }

    function goHome() {
        window.location.href = '/'
    }
</script>

<div class="m-3">
    <div>
        <h4>Endpoint</h4>
        <input class="checkbox" type="radio" name="endpoint" value="prod" checked={currentEndpoint === "prod"}
               on:click={() => setEndpoint('prod')}/> Production
        <input class="checkbox" type="radio" name="endpoint" value="local" checked={currentEndpoint === "local"}
               on:click={() => setEndpoint('local')}/> Local
    </div>
    <div class="mt-3">
        <h4>UI</h4>
        <input class="checkbox" type="radio" name="ui" value="milestone1" checked={currentUi === "milestone1"}
               on:click={() => setUi('milestone1')}/> Milestone 1
        <input class="checkbox" type="radio" name="ui" value="incremental-modeling" checked={currentUi === "incremental-modeling"}
               on:click={() => setUi('incremental-modeling')}/> Incremental modeling
    </div>
    <button class="btn mt-8" on:click={goHome}>Save and restart app</button>
</div>