<script lang="ts">
    import {createEventDispatcher} from 'svelte'
    import type {SelectChangeEvent} from "./types";

    export let conjunction: string
    export let classes = ""
    export let disabled = false

    const dispatch = createEventDispatcher()

    function conjunctionChanged(event: Event) {
        const target = event.target as HTMLSelectElement
        dispatch('conjunctionChanged', {conjunction: target.value})
    }
</script>

<div class="{classes}">
    <select class="input input-bordered" {disabled} on:change={conjunctionChanged}>
        <option selected={conjunction === "and"}>and</option>
        <option selected={conjunction === "or"}>or</option>
    </select>
</div>
