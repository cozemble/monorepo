<script>
  import ManageModels from "$lib/generative/components/ManageModels.svelte";
  import {goto} from "$app/navigation";
  import {onMount, tick} from "svelte";
  import {autoExpand} from "$lib/generative/autoExpander";

  function startOver() {
    goto("/?startOver=true")
  }

  onMount(async () => {
    await tick()
    setTimeout(autoExpand, 5)
  })
</script>

<div class="content">
    <ManageModels/>
</div>

<footer class="footer p-10 bg-primary-content">
    <div class="flex w-full">
        <button class="btn btn-primary mx-auto btn-wide btn-lg" on:click={startOver}>Start over</button>
    </div>
</footer>

