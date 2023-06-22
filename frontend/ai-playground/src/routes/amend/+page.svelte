<script>
  import ManageModels from "$lib/generative/components/ManageModels.svelte";
  import {goto} from "$app/navigation";

  function startOver() {
    // console.log("Starting over")
    // modelStore.update(() => {
    //   return eventSourcedModelListFns.newInstance([])
    // })
    // navbarState.set(null)
    goto("/?startOver=true")
  }
</script>

<div class="content">
    <ManageModels/>
</div>

<footer class="footer p-10 bg-primary-content">
    <div class="flex w-full">
        <button class="btn btn-primary mx-auto btn-wide btn-lg" on:click={startOver}>Start over</button>
    </div>
</footer>

