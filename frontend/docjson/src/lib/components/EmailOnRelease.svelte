<script lang="ts">
  import Icon from '@iconify/svelte'
  import { onMount } from 'svelte'

  let value: string
  let isOpen = false
  let hasSubmitted = false

  // check if user has already submitted email
  onMount(() => {
    const hasSubmittedEmail = localStorage.getItem('hasSubmittedEmail')

    if (hasSubmittedEmail) hasSubmitted = true
  })

  function handleSubmit() {
    console.log('You submitted: ' + value)
  }

  function mainHandler() {
    if (!isOpen) return (isOpen = true)

    handleSubmit()
    isOpen = false
    hasSubmitted = true

    // save to local storage if user has submitted email
    localStorage.setItem('hasSubmittedEmail', 'true')
  }

  $: buttonText =
    (isOpen && 'Join Waitlist') ||
    (hasSubmitted && 'Thanks for joining!') ||
    'Want to get notified?'

  $: tooltipText =
    (isOpen && 'We will notify you via email') ||
    (hasSubmitted && 'You have joined the waitlist!') ||
    'Get notified when we release the first version of tojson.'

  $: buttonClass =
    (isOpen && 'btn-primary join-item') || (hasSubmitted && 'btn-success') || 'btn-secondary'

  $: tooltipClass =
    (isOpen && 'tooltip-primary') || (hasSubmitted && 'tooltip-success') || 'tooltip-neutral'
</script>

<div class="tooltip {tooltipClass}" data-tip={tooltipText}>
  <div class="join">
    <input
      type="email"
      class="input input-primary join-item w-0 transition-all duration-200 
            {isOpen ? 'w-64 visible ' : 'pointer-events-none p-0 border-0'}"
      placeholder="Your email address"
      bind:value
    />

    <button class="pr-6 btn {buttonClass}" on:click={mainHandler}>
      <Icon icon={hasSubmitted ? 'mdi:bell-check' : 'mdi:bell'} class="mr-1 text-xl" />
      {buttonText}
    </button>
  </div>
</div>
