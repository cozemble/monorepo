<script lang="ts">
  import { onMount } from 'svelte'
  import { writable } from 'svelte/store'

  export let text: string
  export let speed: number = 50
  export let startDelay: number = 0

  const animatedText = writable([] as string[])

  const animateTyping = async (text: string) => {
    const textArray = text.split('')

    animatedText.subscribe((val) => {
      if (val.length >= textArray.length) return

      const nextLetter = textArray[val.length]

      if (nextLetter === undefined) return

      setTimeout(() => {
        animatedText.update((val) => [...val, nextLetter])
      }, speed)
    })
  }

  onMount(() => {
    setTimeout(() => {
      animateTyping(text)
    }, startDelay)
  })
</script>

{#each $animatedText as letter}
  {#if letter === ' '}
    {' '}
  {:else}
    <span class="inline-block text-inherit animate-fade-in">
      {letter}
    </span>
  {/if}
{/each}

<span class="text-[0.7em] text-base-content/50 animate-blink ">_</span>

<style>
  span {
    letter-spacing: inherit;
    word-spacing: inherit;
    line-height: inherit;
  }
</style>
