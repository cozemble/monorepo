<script lang="ts">
  import Icon from '@iconify/svelte'
</script>

<header>
  <div class="navbar px-6">
    <div class="flex-1">
      <a class="btn btn-ghost normal-case text-3xl" href="/"
        >doc
        <span class="text-primary">json</span>
      </a>
    </div>
    <div class="flex-none gap-6">
      <a class="hover:link normal-case" href="/dashboard"> Dashboard </a>
      <a class="hover:link normal-case" href="/docs"> Docs </a>
      <a class="hover:link normal-case text-secondary" href="/pricing"> Pricing </a>
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
          class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            <a class="justify-between" href="/user">
              Profile
              <span class="badge">New</span>
            </a>
          </li>
          <li><a href="/user/settings">Settings</a></li>
          <li><a href="/user/logout">Logout</a></li>
        </ul>
      </div>
    </div>
  </div>
</header>
