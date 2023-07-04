<script lang="ts">
    // import global css for tailwind and daisyui
    import '../lib/styles/global.css'
    import {browser} from '$app/environment';
    import {onMount} from 'svelte';

    let currentEndpoint = 'prod'

    onMount(() => {
        if (browser) {
            currentEndpoint = localStorage.getItem('cozemble.config.endpoint') || 'prod'
        }
    })
</script>

<main>
    <slot/>
</main>
{#if currentEndpoint !== 'prod'}
    <div>Using endpoint "{currentEndpoint}" - <a href="/cozconfig">Change</a></div>
{/if}

<!-- hidden content to force tailwind styles to be compiled in.  Yes, crazy -->
<div class="form-group mb-3 invisible">
        <input type="text" class="form-control input input-bordered border border-primary border-4"/>
</div>
