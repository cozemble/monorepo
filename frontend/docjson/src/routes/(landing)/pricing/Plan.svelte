<script lang="ts">
  import Icon from '@iconify/svelte'

  import type { Plan } from '.'

  export let plan: Plan
  /** Disabled state to show the option is not available */
  $: ghost = plan?.ghost || false
</script>

<!-- TODO explore bg-gray-500 -->
<!-- in Chrome, nesting items with backdrop-filter: blur is buggy -->
<div
  class="card p-8 max-w-[22em] w-full relative bg-base-100 shadow-xl text-base-content
         transition-all duration-200 hover:shadow-2xl
         {plan?.highlight && 'border-2 border-neutral border-solid'}
         {ghost ? 'pointer-events-none bg-opacity-20' : 'glass bg-opacity-10'}"
>
  <div class="card-title flex flex-col items-start justify-start gap-0">
    <h3 class="text-3xl mb-2">{plan.name}</h3>

    <p class="h-10 leading-5 text-base font-light text-base-100">{plan.info}</p>

    <div class="divider mt-0 opacity-50" />

    <!-- Price -->
    <div class="w-full my-2 flex items-end">
      <div class="text-5xl mr-2 leading-10">
        {plan.price}
      </div>

      <span class="text-lg font-normal text-base-100/70 leading-5">
        {plan?.priceInfo || ''}
      </span>
    </div>
  </div>

  <div class="divider opacity-50" />

  <div class="card-body px-0 pt-2">
    <!-- Features heading -->
    <h4 class="mb-4 text-sm font-normal text-base-100/70 ">
      {plan.featuresHeading}
    </h4>

    <!-- Features List -->
    <ul class="card gap-3">
      {#each plan.features as feature}
        <li
          class="flex items-start text-center {feature?.available === false && 'text-neutral/30'}"
        >
          <Icon
            icon={feature.icon}
            class="w-7 h-6 text-base-100/70 flex-shrink-0
          {feature?.available === false && 'opacity-50'}
          "
          />

          <h5 class="self-center ml-2 mr-4 font-normal text-sm text-start leading-4">
            {feature.name}

            <!-- Info tooltip -->
            {#if feature?.info}
              <div class="tooltip ml-2 before:z-50 before:max-w-[15rem]" data-tip={feature.info}>
                <Icon icon="mdi:information" class="text-sm" />
              </div>
            {/if}
          </h5>
        </li>
      {/each}
    </ul>
  </div>

  <div class="card-actions mt-6">
    <button class="btn btn-neutral w-full {ghost && 'btn-disabled'}" on:click={plan.action.handler}>
      {plan.action.name}
    </button>
  </div>

  <!-- Ghost state cover -->
  {#if ghost}
    <div
      class="card absolute inset-0 flex items-center justify-center
            backdrop-blur-md z-[1] overflow-hidden"
    >
      <h1
        class="p-2 w-[35em] shrink-0 -rotate-12 max-w-none opacity-50 bg-base-content text-base-100 text-2xl text-center"
      >
        Coming Soon!
      </h1>
    </div>
  {/if}
</div>
