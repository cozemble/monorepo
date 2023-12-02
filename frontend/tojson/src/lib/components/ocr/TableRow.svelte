<script lang="ts">
  import Icon from '@iconify/svelte'

  export let data: string[]
  export let index: number | undefined
  export let state: 'pending' | 'approved' | 'error' | 'warning' = 'pending'
</script>

<tr
  class="
  hover:bg-base-200 
  {state === 'pending' && ''}
  {state === 'approved' && 'opacity-50'}
  {state === 'warning' && 'bg-warning/30'}
  {state === 'error' && 'bg-error/50'}
  "
>
  {#if index}
    <th>{index}</th>
  {/if}

  {#each data as cell}
    <td>{cell}</td>
  {/each}

  <td align="right">
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-circle btn-xs">
        <Icon icon="entypo:dots-three-vertical" class="w-3 h-3" />
      </div>
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <ul
        tabindex="0"
        class="dropdown-content menu menu-horizontal gap-1 rounded-box p-2 bg-base-100 z-10"
      >
        <li>
          <button class="btn btn-xs btn-circle btn-success btn-outline" title="Approve">
            <Icon icon="entypo:check" class="w-5 h-5" />
          </button>
        </li>
        <li>
          <button class="btn btn-xs btn-circle btn-secondary btn-outline" title="Label">
            <Icon icon="entypo:tag" class="w-5 h-5" />
          </button>
        </li>
        <li>
          <button class="btn btn-xs btn-circle btn-warning btn-outline" title="Merge">
            <Icon icon="entypo:merge" class="w-5 h-5" />
          </button>
        </li>
        <li>
          <button class="btn btn-xs btn-circle btn-error btn-outline" title="Delete">
            <Icon icon="entypo:trash" class="w-5 h-5" />
          </button>
        </li>
      </ul>
    </div>
  </td>
</tr>
