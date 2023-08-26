<script lang="ts">
  import { tweened } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'
  import type { SvelteComponent } from 'svelte'

  type Step = {
    name: string
    message: string
    progress: number
    state: 'pending' | 'success' | 'error'
    handler: () => Promise<void>
    component?: SvelteComponent
  }

  /** Between 0 and 1 */
  let progress = 0.05
  let step: Step = {
    name: 'Initiating',
    message: 'Initializing the process',
    state: 'pending',
    progress: 0.3,
  }

  const progressStore = tweened(0, {
    duration: 400,
    easing: cubicOut,
  })

  $: progressStore.set(progress)

  // <!-- TODO actual steps -->

  const steps = [
    {
      name: 'OCR Documents',
      message: 'Reading your documents',
      state: 'pending',
      progress: 0.3,
      handler: async function () {
        // <!-- TODO -->

        const mockInterval = setInterval(() => {
          if (progress >= 1) {
            this.state = 'success'
            clearInterval(mockInterval)
          }
          progress += Math.random() / 10
        }, 1000)
      },
    },
    {
      name: 'Schema',
      message: 'Creating your schema',
      state: 'pending',
      progress: 0.6,
      handler: async function () {
        // <!-- TODO -->

        const mockInterval = setInterval(() => {
          if (progress >= 1) {
            this.state = 'success'
            clearInterval(mockInterval)
          }
          progress += Math.random() / 10
        }, 1000)
      },
    },
    {
      name: 'Database',
      message: 'Creating your database',
      state: 'pending',
      progress: 0.9,
      handler: async function () {
        // <!-- TODO -->

        const mockInterval = setInterval(() => {
          if (progress >= 1) {
            this.state = 'success'
            clearInterval(mockInterval)
          }
          progress += Math.random() / 10
        }, 1000)
      },
    },
  ]

  // <!-- ! simulate progress and steps for demo -->
  function simulate() {
    const mockSteps: Step[] = [
      {
        name: 'OCR Documents',
        message: 'Reading your documents',
        state: 'pending',
        progress: 0.3,
      },
      {
        name: 'Schema',
        message: 'Creating your schema',
        state: 'pending',
        progress: 0.6,
      },
      {
        name: 'Database',
        message: 'Creating your database',
        state: 'pending',
        progress: 0.9,
      },
    ]

    setInterval(() => {
      if (progress >= 1) return (progress = 0.05)
      progress += Math.random() / 10
    }, 1000)

    setInterval(() => {
      const index = mockSteps.indexOf(step)
      if (index === -1) return (step = mockSteps[0])
      if (index >= mockSteps.length - 1) return (step = mockSteps[0])

      step = mockSteps[index + 1]
      mockSteps[index].state = 'success'
    }, 4000)
  }

  simulate()
</script>

<!-- @component
  Handles the steps of the model creation process and redirects to the dashboard when the process is finished.
-->

<div class="flex flex-col items-center justify-center w-full sm:mt-20">
  <!--  -->

  <!-- * steps list -->
  <div class="steps-area flex flex-col w-full max-w-[50em]">
    <ul class="steps gap-4">
      <li class="step step-primary">Document OCR</li>
      <li class="step step-primary">Create Schema</li>
      <li class="step">Create Database</li>
      <li class="step">Populate Records</li>
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

<!-- * progress indicator -->
<div class="progress-area w-full flex flex-col items-center justify-center ">
  <!-- step message -->
  <p class="mb-4 text-center ">
    {step.message}
  </p>

  <span class="loading loading-md loading-dots mb-4" />

  <progress
    class="progress progress-secondary w-full h-3 justify-self-end transition ease-in"
    value={$progressStore}
  />
</div>
