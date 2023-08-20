<script lang="ts">
  import { tweened } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'
  import type { SvelteComponent } from 'svelte'

  type Step = {
    name: string
    message: string
    progress: number
    component?: SvelteComponent
  }

  /** Between 0 and 1 */
  let progress = 0.05
  let step: Step = {
    name: 'Initiating',
    message: 'Initializing the process',
    progress: 0.3,
  }

  const progressStore = tweened(0, {
    duration: 400,
    easing: cubicOut,
  })

  $: progressStore.set(progress)

  // <!-- TODO actual steps -->

  // <!-- ! simulate progress and steps for demo -->
  function simulate() {
    const mockSteps: Step[] = [
      {
        name: 'OCR',
        message: 'Reading your documents',
        progress: 0.3,
      },
      {
        name: 'Schema',
        message: 'Creating your schema',
        progress: 0.6,
      },
      {
        name: 'Database',
        message: 'Creating your database',
        progress: 0.9,
      },
    ]

    setInterval(() => {
      if (progress >= 1) return (progress = 0.05)
      progress += Math.random() / 10
    }, 1000)

    setInterval(() => {
      const index = mockSteps.indexOf(step)
      if (index >= mockSteps.length - 1) return (step = mockSteps[0])

      step = mockSteps[index + 1]
    }, 4000)
  }

  simulate()
</script>

<!-- @component
  Handles the steps of the model creation process and redirects to the dashboard when the process is finished.
-->

<div class="flex flex-col items-center justify-center w-full text-center">
  <!-- -->

  <div class="title-area mb-20">
    <h1 class="text-accent mb-4">Creating your model</h1>

    <p class="opacity-50">
      This usually takes a little while. Sit back and relax or come back later.
    </p>
  </div>

  <!-- TODO steps list -->
</div>

<!-- TODO display component of the step if it exists -->

<!-- progress indicator -->
<div class="progress-area flex flex-col items-center justify-center">
  <!-- step message -->
  <p class="mb-4 text-center ">
    {step.message}
  </p>

  <span class="loading loading-md loading-dots mb-4" />

  <progress
    class="progress progress-secondary w-full justify-self-end transition ease-in"
    value={$progressStore}
  />
</div>
