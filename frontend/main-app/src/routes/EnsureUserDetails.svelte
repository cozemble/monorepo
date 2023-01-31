<script lang="ts">
    import type {AuthUser} from '@supabase/supabase-js'
    import {getContext, onMount} from 'svelte'
    import {supabaseContext} from "../lib/supabase/context";
    import type {CombinedUser, User} from "../lib/supabase/flattened_types";

    export let authUser: AuthUser
    const supabase = supabaseContext.get(getContext)
    let user: User | null = null

    let mounted = false
    let fetchUserDetails = false
    let firstName = ''
    let firstNameError = ''
    onMount(async () => {
        const {data: users, error} = await supabase
            .from('users')
            .select()
            .eq('supabase_id', authUser.id)
        if (users) {
            if (users.length === 0) {
                fetchUserDetails = true
            } else {
                user = users[0]
            }
        }
        mounted = true
    })

    function init(el: HTMLInputElement) {
        el.focus()
    }

    async function firstNameProvided(event: Event) {
        event.preventDefault()
        if (firstName.length < 2) {
            firstNameError = "Please enter your first name"
        } else {
            await supabase
                .from('users')
                .insert([{supabase_id: authUser.id, first_name: firstName}])
                .then(({data, error}) => {
                    if (error) {
                        console.log('error', error)
                    }
                })
            const {data: users, error} = await supabase
                .from('users')
                .select()
                .eq('supabase_id', authUser.id)
            if (users && users.length > 0) {
                user = users[0]
            }
        }
    }

    function mandatoryUser(user: User | null): CombinedUser {
        if (user) {
            return {user, authUser}
        } else {
            throw new Error("User is null")
        }
    }
</script>
{#if mounted}
    {#if fetchUserDetails}
        <form on:submit={firstNameProvided}>
            <label for="firstName">Hi {authUser.email}, please can you tell me your first name?</label><br/>
            <input id="firstName" type="text" bind:value={firstName} use:init minlength=2/><br/>
            {#if firstNameError}
                <span style="color: red">{firstNameError}</span><br/>
            {/if}
        </form>
    {/if}
    {#if user}
        <slot user={mandatoryUser(user)}></slot>
    {:else}
        <p>Failed to load user</p>
    {/if}
{/if}