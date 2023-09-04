<script lang="ts">
  import Icon from '@iconify/svelte'

  import type { Plan } from './'

  export let option: Plan
  /** Disabled state to show the option is not available */
  export let ghost: boolean = false
</script>

<div class={`card p-8 max-w-[22em] w-full glass bg-base-100/10 shadow-xl text-base-content`}>
  <div class="card-title flex flex-col items-start justify-start">
    <h3 class="text-3xl">{option.name}</h3>
    <div class="w-full flex items-baseline">
      <div class="text-6xl mr-2">
        ${option.price}
      </div>
      <div class="text-base font-thin text-base-100">per month</div>
    </div>

    <p class="h-10 mt-8 text-base font-thin text-base-100">{option.info}</p>
    <!-- Pricing -->
  </div>

  <div class="divider" />

  <!-- Features List -->
  <div class="card-body px-0 pt-2">
    <h4 class="text-base font-normal text-start mb-2 text-base-100">
      {option.featuresHeading}
    </h4>
    <ul class="card gap-3">
      {#each option.features as feature}
        <li class="flex items-start text-center {feature?.available === false && 'opacity-40'}">
          {#if feature.icon}
            <Icon icon={feature.icon} class="w-6 h-6 text-base-100/70" />
          {/if}

          <h5 class="ml-2 mr-4 font-normal text-sm text-start">{feature.name}</h5>

          {#if feature?.info}
            <div class="tooltip" data-tip={feature.info}>
              <Icon icon="mdi:information" class="text-base text-neutral" />
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  </div>

  <div class="card-actions justify-end">
    <button class="btn btn-neutral w-full" on:click={option.action.handler}>
      {option.action.name}
    </button>
  </div>
</div>
