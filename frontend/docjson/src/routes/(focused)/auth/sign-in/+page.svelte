<script lang="ts">
  import Icon from '@iconify/svelte'

  import AuthPageLayout from '../AuthPageLayout.svelte'
  import LoginForm from './LoginForm.svelte'
</script>

<AuthPageLayout
  formTitle="Sign In"
  heading="Welcome back!"
  subheading="Sign in to your account to continue"
  otherPageLinkName="don't have an account yet?"
  otherPageLink="/auth/sign-up"
>
  <LoginForm slot="form" />

  <!-- TODO handle SSO -->
  <!-- SSO -->
  <button slot="sso" class="btn btn-link text-neutral w-full mt-3">
    <Icon icon="mdi:lock-outline" class="w-6 h-6" />
    <span>Continue with SSO</span>
  </button>
</AuthPageLayout>
