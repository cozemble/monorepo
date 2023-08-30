<script lang="ts">
  import type { SvelteComponent } from 'svelte'
  import { get, writable, type Writable } from 'svelte/store'

  import { goto } from '$app/navigation'
  import ProgressBar from "$lib/components/ProgressBar.svelte";

  type Step = {
    name: string
    message: string
    state: 'pending' | 'success' | 'error'
    handler: (progressStore: Writable<number>) => Promise<{
      success: boolean
      error?: string
    }>
    component?: SvelteComponent
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
      message: 'Reading your documents',
      state: 'pending',
      handler: mockHandler,
    },
    {
      name: 'Create Schema',
      message: 'Creating your schema',
      state: 'pending',
      handler: mockHandler,
    },
    {
      name: 'Create Database',
      message: 'Creating your database',
      state: 'pending',
      handler: async (progressStore) => {
        // <!-- TODO create database -->
        modelId = '123'
        return await mockHandler(progressStore)
      },
    },
    {
      name: 'Populate Records',
      message: 'Populating your records',
      state: 'pending',
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
      handler: async () => ({ success: true }),
    }
    setTimeout(() => {
      goto(`/dashboard/models/${modelId}`)
    }, 1000)

    return
  }

  runSteps()
</script>

<!-- @component
  Handles the steps of the model creation process and redirects to the dashboard when the process is finished.
-->

<div class="flex flex-col items-center justify-center w-full sm:mt-20">
  <!--  -->

  <!-- * steps list -->
  <div class="steps-area flex flex-col w-full max-w-[50em]">
    <ul class="steps gap-4">
      {#each steps as step}
        {@const stepStyle =
          (step.state === 'success' && 'step-primary') ||
          (step.state === 'error' && 'step-error') ||
          ''}
        <li class="step {stepStyle}">
          {step.name}
        </li>
      {/each}
    </ul>
  </div>

  <!-- * heading -->
  <div class="title-area mb-40 mt-8 sm:mt-28 text-center">
    <h1 class="text-accent mb-4">Creating your model</h1>

    <p class="opacity-50">
      This usually takes a little while. Sit back and relax or come back later.
    </p>
  </div>
</div>

<!-- TODO display component of the step if it exists -->

<ProgressBar message={currentStep.message} progress={$progressStore} />
