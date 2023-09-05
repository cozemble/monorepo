<script lang="ts">
  import Icon from '@iconify/svelte'

  import type { Plan } from './'

  export let option: Plan
  /** Disabled state to show the option is not available */
  export let ghost: boolean = false
</script>

<div class={`card p-8 max-w-[22em] w-full glass bg-base-100/10 shadow-xl text-base-content`}>
  <div class="card-title flex flex-col items-start justify-start gap-0">
    <h3 class="text-3xl mb-2">{option.name}</h3>

    <p class="h-8 leading-5 text-base font-light text-base-100">{option.info}</p>

    <div class="divider opacity-50" />

    <div class="w-full my-4 flex items-end">
      <div class="text-6xl mr-2 leading-10">
        {option.price}
      </div>

      <span class="text-lg font-normal text-base-100/70 leading-5">
        {option?.priceInfo || ''}
      </span>
    </div>
  </div>

  <div class="divider opacity-50" />

  <!-- Features List -->
  <div class="card-body px-0 pt-2">
    <ul class="card gap-3">
      <li class="flex items-start text-center">
        <div class="w-7 h-6 text-base-100/70 flex-shrink-0" />
        <h4 class="ml-2 text-sm font-normal text-base-100/70 ">
          {option.featuresHeading}
        </h4>
      </li>

      {#each option.features as feature}
        <li class="flex items-start text-center {feature?.available === false && 'opacity-40'}">
          {#if feature.icon}
            <Icon icon={feature.icon} class="w-7 h-6 text-base-100/70 flex-shrink-0" />
          {/if}

          <h5 class="self-center ml-2 mr-4 font-normal text-sm text-start leading-4">
            {feature.name}
          </h5>

          {#if feature?.info}
            <div class="tooltip" data-tip={feature.info}>
              <Icon icon="mdi:information" class="text-sm text-neutral" />
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  </div>

  <div class="card-actions">
    <button class="btn btn-neutral w-full" on:click={option.action.handler}>
      {option.action.name}
    </button>
  </div>
</div>
