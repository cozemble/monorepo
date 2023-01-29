<script lang="ts">
    import {type AuthUser, createClient} from '@supabase/supabase-js'
    import {onMount} from 'svelte'
    import {PUBLIC_SUPABASE_KEY} from '$env/static/public';

    const supabaseUrl = 'https://hxtxpwuuosksrtzditay.supabase.co'
    const supabase = createClient(supabaseUrl, PUBLIC_SUPABASE_KEY)

    async function signInUsingGithub() {
        const {data, error} = await supabase.auth.signInWithOAuth({
            provider: 'github'
        })
    }

    let user: AuthUser | null = null
    let mounted = false
    let anError: any = null
    onMount(async () => {
        const {data, error} = await supabase.auth.getUser()
        if (error) {
            anError = error
        } else {
            user = data.user
        }
        mounted = true
    })
</script>
<h1>Welcome to Cozemble App</h1>
{#if anError}
    <h2>There was an error: {anError.message}</h2>
{/if}
{#if mounted}
    {#if user}
        <h2>Hello {user.email}</h2>
    {:else}
        <h2>Hello Guest</h2>
        <button type="button" on:click={signInUsingGithub}>Sign in using Github</button>
    {/if}
{:else}
    <h2>Loading...</h2>
{/if}