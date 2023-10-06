<script lang="ts">
  import type { EventHandler } from 'svelte/elements'
  import { writable } from 'svelte/store'
  import { z } from 'zod'

  import FormInput from '$lib/components/form/FormInput.svelte'
  import notifications from '$lib/stores/notifications'

  export let switchForm: () => void
  export let form: Record<string, string>

  let helperText: HelperText = { error: false, text: null }

  let values = {
    name: '',
    email: '',
    password: '',
    term: false,
  }
  $: if (form?.name) values.name = form.name
  $: if (form?.email) values.email = form.email

  $: console.log(values)

  //

  const Schema = z.object({
    name: z
      .string()
      .min(4, 'Name should be longer than 4 characters')
      .max(24, 'Name should be shorter than 24 characters'),
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(8, 'Password should be minimum 8 characters'),
    term: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms & conditions' }),
    }),
  })

  let errors = writable<{
    name?: string
    email?: string
    password?: string
    term?: string
  }>({})

  //

  const onSubmit: EventHandler = async () => {
    errors.set({})

    const validation = Schema.safeParse(values)

    if (!validation.success) {
      const errs = validation.error.flatten().fieldErrors

      console.error(errs)

      errors.set({
        name: errs.name?.[0],
        email: errs.email?.[0],
        password: errs.password?.[0],
        term: errs.term?.[0],
      })

      notifications.create({
        text: 'Error',
        description: 'Please check the form for errors',
        type: 'error',
        duration: 2000,
      })

      return
    }

    // mock the behavior for now
    // <!-- TODO actual sign up -->

    console.warn(validation.data)

    const notification = notifications.create({
      text: 'Signing up',
      description: 'Please wait while we sign you up',
      type: 'loading',
      isClosable: false,
    })

    setTimeout(() => {
      notification.handleClose()
      notifications.create({
        text: 'Success',
        description: 'You have been signed up successfully',
        type: 'success',
        duration: 2000,
      })
    }, 2000)
  }
</script>

<!-- TODO display check your email after submit -->

<!-- svelte-ignore empty-block -->
{#if !!helperText.text}{/if}

<form>
  <FormInput name="name" bind:value={values.name} error={$errors?.name} placeholder="Your Name" />

  <FormInput
    name="email"
    bind:value={values.email}
    error={$errors?.email}
    placeholder="you@example.com"
  />

  <FormInput
    name="password"
    bind:value={values.password}
    error={$errors?.password}
    placeholder="••••••••"
    type="password"
  />

  <div class="form-control">
    <label class="label cursor-pointer">
      <input
        type="checkbox"
        name="term"
        bind:checked={values.term}
        class="checkbox checkbox-primary"
      />
      <span class="label-text">I accept the privacy policy and terms of use </span>
    </label>

    <label for="term" class="label text-error pb-0 pt-1">
      <div />
      <label for="" class="label-text-alt text-error">
        {$errors?.term || ''}
      </label>
    </label>
  </div>

  <div class="flex flex-col items-center mt-6">
    <button type="submit" class="btn btn-primary w-full" on:click={onSubmit}>Sign in</button>

    <button class="link-hover pt-2 text-sm opacity-50 hover:opacity-70" on:click={switchForm}>
      already have an account?
    </button>
  </div>
</form>
