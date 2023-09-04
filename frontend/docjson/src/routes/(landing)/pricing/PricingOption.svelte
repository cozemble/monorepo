<script lang="ts">
  import Icon from '@iconify/svelte'

  import type { Plan } from './'

  export let option: Plan
  /** Disabled state to show the option is not available */
  export let ghost: boolean = false
</script>

<div class={`card py-8 px-8 w-[24em] glass bg-base-100/10 shadow-xl text-base-content text-center`}>
  <div class="card-title flex flex-col">
    <h3 class="text-3xl">{option.name}</h3>
    <p class="text-base font-thin text-base-100">{option.info}</p>
    <!-- Pricing -->
    <div class="w-full mt-5 flex items-baseline">
      <div class="text-6xl mr-2">
        ${option.price}
      </div>
      <div class="text-base font-thin text-base-100">per month</div>
    </div>
  </div>

  <!-- Features List -->
  <div class="card-body px-0">
    <ul class="card gap-3">
      {#each option.features as feature}
        <li class="flex items-center text-center {!feature.available && 'opacity-30'}">
          {#if feature.icon}
            <Icon icon={feature.icon} class="w-6 h-6 text-base-100/70" />
          {/if}

          <h4 class="ml-2 mr-4 font-normal text-sm whitespace-nowrap">{feature.name}</h4>

          {#if feature?.info}
            <div class="tooltip" data-tip={feature.info}>
              <Icon icon="mdi:information" class="text-base text-neutral" />
            </div>
          {/if}

          <span class="tooltip ml-auto" data-tip="Monthly usage limit">
            {feature?.limit ? (feature.limit === 0 ? '-' : feature.limit + feature?.unit) : '∞'}
          </span>
        </li>
      {/each}
    </ul>
  </div>

  <div class="card-actions justify-end">
    <button class="btn btn-neutral" on:click={option.action.handler}>
      {option.action.name}
    </button>
  </div>
</div>
