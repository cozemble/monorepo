<script lang="ts">
  import type { SvelteComponent } from 'svelte'
  import { get, writable, type Writable } from 'svelte/store'

  import { goto } from '$app/navigation'
  import ProgressBar from '$lib/components/ProgressBar.svelte'
  import CorrectOcr from './CorrectOCR.svelte'

  // <!-- TODO user can go back to previous steps -->

  type Step = {
    name: string
    message: string
    detail?: string
    state: 'pending' | 'success' | 'error'
    withProgress: boolean
    handler: (progressStore: Writable<number>) => Promise<{
      success: boolean
      error?: string
    }>
    component?: any
  }

  let modelId: string
  /** Between 0 and 1 */
  const progressStore = writable(0.02)

  const resetProgressStore = () => {
    progressStore.set(0.02)
  }

  // <!-- ! Mock handler that updates the progress store until it reaches 1 -->
  const mockHandler: Step['handler'] = async function (progressStore) {
    return await new Promise((resolve) => {
      const mockInterval = setInterval(() => {
        const progress = get(progressStore)

        if (progress >= 1) {
          clearInterval(mockInterval)
          resolve({ success: true })
        }

        progressStore.set(progress + (Math.random() / 10) * 4)
      }, 1000)
    })
  }

  let steps: Step[] = [
    {
      name: 'Document OCR',
      message: 'Scanning your document',
      detail: 'This may take a while',
      state: 'pending',
      withProgress: true,
      handler: mockHandler,
    },
    {
      name: 'Correct OCR',
      message: 'Correcting your document',
      detail: 'Please correct your scanning results',
      state: 'pending',
      withProgress: false,
      component: CorrectOcr,
      handler: async () => {
        // take forever and never resolve
        return await new Promise(() => {})
      },
    },
    {
      name: 'Define Schema',
      message: 'Generating JSON Schema',
      detail: 'You can edit the schema afterwards',
      state: 'pending',
      withProgress: true,
      handler: async (progressStore) => {
        // <!-- TODO create database -->
        modelId = '123'
        return await mockHandler(progressStore)
      },
    },
    {
      name: 'Create API',
      message: 'Populating your records',
      detail: 'This usually takes a little while. Sit back and relax or come back later.',
      state: 'pending',
      withProgress: true,
      handler: mockHandler,
    },
  ]

  let activeStepIdx = 0
  let currentStep: Step = steps[activeStepIdx]
  $: currentStep = steps[activeStepIdx]

  /** 
  - run steps recursively
  - if a step fails, stop the process and display the error */
  async function runSteps() {
    resetProgressStore()

    const stepResult = await steps[activeStepIdx].handler(progressStore)
    steps[activeStepIdx].state = stepResult.success ? 'success' : 'error'

    // fail
    if (!stepResult.success) {
      // <!-- TODO display error -->
      return
    }

    // next step
    if (activeStepIdx + 1 < steps.length) {
      activeStepIdx += 1
      runSteps()
      return
    }

    // finish
    currentStep = {
      name: 'Finished',
      message: 'Redirecting to your model',
      state: 'success',
      withProgress: false,
      handler: async () => ({ success: true }),
    }
    setTimeout(() => {
      // goto(`/dashboard/models/${modelId}`)
      activeStepIdx = 0
      steps = steps.map((step) => ({ ...step, state: 'pending' }))
      runSteps()
    }, 1000)

    return
  }

  runSteps()
</script>

<!-- @component
  Handles the steps of the model creation process and redirects to the dashboard when the process is finished.
-->

<div class="flex flex-col items-center justify-center w-full sm:mt-12">
  <!--  -->

  <!-- * steps list -->
  <div class="steps-area flex flex-col w-full max-w-[50em]">
    <ul class="steps gap-4">
      {#each steps as step}
        {@const stepStyle =
          (step.state === 'success' && 'step-primary') ||
          (step.state === 'error' && 'step-error') ||
          (step.name === currentStep.name && 'font-bold') ||
          ''}
        <li class="step {stepStyle}">
          {step.name}
        </li>
      {/each}
    </ul>
  </div>

  <!-- * heading -->
  <div class="title-area my-8 sm:mt-12 text-center">
    <h1 class="text-accent mb-4">{currentStep.message}</h1>

    <p class="opacity-50">
      {currentStep.detail || ''}
    </p>
  </div>
</div>

<!-- TODO display component of the step if it exists -->
{#if currentStep.component}
  <div
    class=" w-full h-full max-w-6xl p-6 gap-6 my-8 flex flex-col flex-grow items-center justify-center bg-base-300 rounded-2xl"
  >
    <svelte:component this={currentStep.component} />
  </div>
{/if}

{#if currentStep.withProgress}
  <ProgressBar message={currentStep.message} progress={$progressStore} />
{/if}
