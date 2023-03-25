<script lang="ts">
    // import global css for tailwind and daisyui
    import '$lib/styles/global.css'
    import {browser} from '$app/environment';
    import {onMount} from 'svelte';

    let currentEndpoint = 'prod'

    onMount(() => {
        if (browser) {
            currentEndpoint = localStorage.getItem('cozemble.config.endpoint') || 'prod'
        }
    })
</script>

{#if currentEndpoint !== 'prod'}
    <div>Using endpoint "{currentEndpoint}" - <a href="/cozconfig">Change</a></div>
{/if}
<main class="p-10">
    <slot/>
</main>
