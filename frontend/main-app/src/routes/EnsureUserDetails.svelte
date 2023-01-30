<script lang="ts">
    import type {AuthUser, SupabaseClient} from '@supabase/supabase-js'
    import {getContext, onMount} from 'svelte'

    export let user: AuthUser

    console.log({user})
    const supabase:SupabaseClient = getContext('supabase')

    let mounted = false
    let fetchUserDetails = false
    let firstName = ''
    let firstNameError = ''
    onMount(async () => {
        const {data: users, error} = await supabase
            .from('users')
            .select()
            .eq('supabase_id', user.id)
        if (users && users.length === 0) {
            fetchUserDetails = true
        }
        mounted = true
    })

    function init(el: HTMLInputElement) {
        el.focus()
    }

    function firstNameProvided(event: Event) {
        event.preventDefault()
        if(firstName.length < 2) {
            firstNameError = "Please enter your first name"
        } else {
            supabase
                .from('users')
                .insert([{supabase_id: user.id, first_name: firstName}])
                .then(({data, error}) => {
                    if (error) {
                        console.log('error', error)
                    } else {
                        console.log('data', data)
                        fetchUserDetails = false
                    }
                })
        }
    }
</script>
{#if mounted}
    {#if fetchUserDetails}
        <form on:submit={firstNameProvided}>
            <label for="firstName">Hi {user.email}, please can you tell me your first name?</label><br/>
            <input id="firstName" type="text" bind:value={firstName} use:init minlength=2/><br/>
            {#if firstNameError}
                <span style="color: red">{firstNameError}</span><br/>
            {/if}
        </form>
    {:else}
        <slot></slot>
    {/if}
{/if}