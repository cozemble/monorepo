<script lang="ts">
  import Icon from '@iconify/svelte'
</script>

<!-- <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-circle btn-sm">
            <Icon icon="entypo:dots-three-vertical" class="w-5 h-5" />
          </div> -->
<ul class="menu menu-horizontal gap-1 rounded-box p-0">
  <li>
    <!-- <div class="tooltip p-0 tooltip-bottom tooltip-success" data-tip="Approve"> -->
    <button class="btn btn-xs btn-circle btn-success " title="Approve">
      <Icon icon="entypo:check" class="w-5 h-5" />
    </button>
    <!-- </div> -->
  </li>
  <li>
    <button class="btn btn-xs btn-circle btn-secondary " title="Label">
      <Icon icon="entypo:tag" class="w-5 h-5" />
    </button>
  </li>
  <li>
    <button class="btn btn-xs btn-circle btn-warning " title="Merge">
      <Icon icon="entypo:merge" class="w-5 h-5" />
    </button>
  </li>
  <li>
    <button class="btn btn-xs btn-circle btn-error " title="Delete">
      <Icon icon="entypo:trash" class="w-5 h-5" />
    </button>
  </li>
</ul>
<!-- </div> -->
