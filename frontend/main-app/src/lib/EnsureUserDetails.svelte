<script lang="ts">
    import type {AuthUser} from '@supabase/supabase-js'
    import {getContext, onMount} from 'svelte'
    import {supabaseContext} from "./supabase/context";
    import type {CombinedUser, User} from "./supabase/flattened_types";
    import {createServersideUser} from "./createServersideUser";

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
        console.log({users, error})
        if (users) {
            if (users.length === 0) {
                fetchUserDetails = true
            } else {
                user = users[0]
            }
        }
        mounted = true
        console.log({mounted, user, fetchUserDetails})
    })

    function init(el: HTMLInputElement) {
        el.focus()
    }

    async function firstNameProvided(event: Event) {
        event.preventDefault()
        if (firstName.length < 2) {
            firstNameError = "Please enter your first name"
        } else {
            const outcome = await createServersideUser(supabase, authUser, firstName)
            if (outcome._type === "just.error.message") {
                alert(`Error creating user: ${outcome.message}`)
            } else {
                user = outcome.value
                fetchUserDetails = false
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
    {:else}
        {#if user}
            <slot user={mandatoryUser(user)}></slot>
        {:else}
            <p>Failed to load user</p>
        {/if}
    {/if}
{/if}
