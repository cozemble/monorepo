<script lang="ts">
  import TableActions from './TableActions.svelte'
  import TableRow from './TableRow.svelte'

  export let tableData: {
    columns: string[]
    rows: string[][]
  }

  export let ordered: boolean = false

  export let state: 'pending' | 'success' | 'error' = 'pending'
  export let label: string = 'Table'
</script>

<div class="rounded-box bg-base-100 overflow-hidden border">
  <div class="flex justify-between bg-base-200 pt-2 px-4">
    <h1 class="text-xl">{label}</h1>
    <TableActions />
  </div>
  <table class="table">
    <thead class="bg-base-200">
      {#if ordered}
        <th />
      {/if}

      {#each tableData.columns as column, i (i)}
        <th class="whitespace-normal">{column}</th>
      {/each}

      <th />
    </thead>

    <tbody>
      {#each tableData.rows as row, i (i)}
        <TableRow
          data={row}
          index={ordered ? i + 1 : undefined}
          state={i === 0
            ? 'pending'
            : i === 1
            ? 'approved'
            : i === 2
            ? 'warning'
            : i === 5
            ? 'error'
            : 'pending'}
        />
      {/each}
    </tbody>
  </table>
</div>
