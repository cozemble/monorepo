<script lang="ts">
  import Logo from '$lib/components/Logo.svelte'
  import Icon from '@iconify/svelte'

  let scrollY = 0
  $: scrolled = scrollY > 50
</script>

<svelte:window bind:scrollY />

<header
  class="sticky top-0 left-0 right-0 bg-base-100/60 backdrop-blur-xl z-50 
  {scrolled ? 'shadow-2xl glass' : ''}"
>
  <div class="navbar px-4 sm:px-6">
    <div class="flex-1">
      <Logo />
    </div>

    <div class="flex-none gap-8 text-neutral">
      <a class="link-hover normal-case hidden sm:block" href="/dashboard"> Dashboard </a>
      <a class="link-hover normal-case hidden sm:block" href="/docs"> Docs </a>
      <a class="link-hover normal-case text-secondary hidden sm:block" href="/pricing"> Pricing </a>

      <div class="dropdown dropdown-end">
        <button tabindex="0" class="btn btn-ghost btn-circle avatar">
          <div class="w-12 rounded-full">
            <!-- <img src="/images/stock/photo-1534528741775-53994a69daeb.jpg" /> -->
            <Icon icon="ic:round-account-circle" class="w-full h-full" />
          </div>
        </button>

        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <ul
          tabindex="0"
          class="menu menu-sm dropdown-content mt-3 z-[1] p-4 shadow-2xl bg-base-100 rounded-box w-52"
        >
          <li>
            <a class="justify-between" href="/user">
              Profile
              <span class="badge">New</span>
            </a>
          </li>
          <li><a href="/user/settings">Settings</a></li>
          <li><a href="/user/login" class="active">Sign Up</a></li>
        </ul>
      </div>
    </div>
  </div>
</header>
