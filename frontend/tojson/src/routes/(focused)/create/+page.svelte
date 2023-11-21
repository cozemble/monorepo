<script lang="ts">
  import type { SvelteComponent } from 'svelte'
  import { get, writable, type Writable } from 'svelte/store'

  import { goto } from '$app/navigation'
  import ProgressBar from '$lib/components/ProgressBar.svelte'
  import CorrectOcr from './CorrectOCR.svelte'
  import notifications from '$lib/stores/notifications'

  // <!-- TODO user can go back to previous steps -->

  type Step = {
    name: string
    message: string
    detail?: string
    state: 'pending' | 'success' | 'error'
    withProgress: boolean
    component?: any
    handler: (progressStore: Writable<number>) => Promise<{
      success: boolean
      error?: string
    }>
  }

  function createStep({ name, message, detail, state, withProgress, handler, component }: Step) {}

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
      // handler: mockHandler,
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

      notifications.create({
        title: 'Error',
        description: stepResult.error || 'Something went wrong',
        type: 'error',
        onCloseCallback: () => {
          notifications.create({
            title: 'Redirecting',
            description: 'Redirecting to the dashboard',
            type: 'info',
          })

          goto(`/`)
        },
      })

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

<div class="flex items-stretch justify-start w-full gap-[5vw] flex-grow ">
  <!-- Steps (left)-->
  <div class="flex flex-col justify-center gap-16 max-w-[50em]">
    <ul class="steps steps-vertical gap-4">
      {#each steps as step}
        {@const isActive = step.name === currentStep.name}
        {@const stepStyle =
          (step.state === 'success' && 'step-primary') ||
          (step.state === 'error' && 'step-error') ||
          (isActive && 'step-primary font-bold text-primary text-xl') ||
          ''}

        <li class="step {stepStyle}">
          <div class="text-start">
            {step.message}

            {#if isActive}
              <p class="opacity-50 font-normal text-sm">
                {currentStep.detail || ''}
              </p>
            {/if}
          </div>
        </li>
      {/each}
    </ul>

    <div class="flex gap-2 w-full">
      <!-- <button class="btn btn-warning">Cancel</button> -->
      <button class="btn btn-secondary">Go Back</button>
      <button class="btn btn-primary">Next</button>
    </div>
  </div>

  <!-- Step View (right) -->
  <div class="flex flex-col items-center justify-center px-10 flex-grow border-l">
    <!-- Component -->
    {#if currentStep.component}
      <div
        class="w-full h-full p-6 gap-6 flex flex-col flex-grow items-center justify-center bg-base-300 rounded-2xl"
      >
        <svelte:component this={currentStep.component} />
      </div>
    {:else}
      <!-- placeholder when no component -->
      <div class="flex flex-col items-center justify-center flex-grow w-full">
        <h1 class="text-4xl text-accent mb-4">{currentStep.message}</h1>
        <p class="opacity-50">
          {currentStep.detail || ''}
        </p>
      </div>
    {/if}

    {#if currentStep.withProgress}
      <div class="w-full pb-4">
        <ProgressBar message={currentStep.message} progress={$progressStore} />
      </div>
    {/if}
  </div>
</div>
