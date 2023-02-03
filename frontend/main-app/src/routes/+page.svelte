<script lang="ts">
    import {type AuthUser, createClient} from '@supabase/supabase-js'
    import {onMount, setContext} from 'svelte'
    import {env} from '$env/dynamic/public';
    import EnsureUserDetails from "../lib/EnsureUserDetails.svelte";
    import {mandatory} from "@cozemble/lang-util";
    import type {Database} from "../lib/supabase/db_types";
    import {supabaseContext} from "../lib/supabase/context";
    import MainPanel from "../lib/MainPanel.svelte";

    const PUBLIC_SUPABASE_KEY = mandatory(env.PUBLIC_SUPABASE_KEY, `No PUBLIC_SUPABASE_KEY in env`)
    const supabaseUrl = 'https://hxtxpwuuosksrtzditay.supabase.co'
    const supabase = createClient<Database>(supabaseUrl, PUBLIC_SUPABASE_KEY)

    supabaseContext.set(setContext, supabase)

    async function signInUsingGithub() {
        console.log("with redirection")
        const {data, error} = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: 'http://localhost:5173'
            }
        })
    }

    let authUser: AuthUser | null = null
    let mounted = false
    let anError: any = null
    onMount(async () => {
        const {data, error} = await supabase.auth.getUser()
        if (error) {
            console.log({error})
        } else {
            authUser = data.user
            const {data: users, error: error2} = await supabase
                .from('users')
                .select()
                .eq('supabase_id', authUser.id)
            console.log({users, error2})
        }
        mounted = true
    })
</script>
<h1>Welcome to Cozemble App</h1>
{#if anError}
    <h2>There was an error: {anError.message}</h2>
{/if}
{#if mounted}
    {#if authUser}
        <EnsureUserDetails {authUser} let:user={user}>
            <MainPanel {user}/>
        </EnsureUserDetails>
    {:else}
        <h2>Hello Guest</h2>
        <button type="button" on:click={signInUsingGithub}>Sign in using Github</button>
    {/if}
{:else}
    <h2>Loading...</h2>
{/if}