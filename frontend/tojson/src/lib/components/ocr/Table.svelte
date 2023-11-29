<script lang="ts">
  export let tableData: {
    columns: string[]
    rows: string[][]
  }

  export let ordered: boolean = false
</script>

<table class="bg-base-100 table table-zebra">
  <thead>
    {#if ordered}
      <th />
    {/if}
    {#each tableData.columns as column}
      <th>{column}</th>
    {/each}
  </thead>

  <tbody>
    {#each tableData.rows as row, i}
      <tr class="">
        {#if ordered}
          <th>{i + 1}</th>
        {/if}

        {#each row as cell}
          <td>{cell}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
