<script>
  import ManageModels from "$lib/generative/components/ManageModels.svelte";
  import {goto} from "$app/navigation";
  import {onMount, tick} from "svelte";
  import {autoExpand} from "$lib/generative/autoExpander";
  import SocialButtons from "$lib/social/SocialButtons.svelte";

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

<footer class="footer p-10 bg-primary-content flex-col flex">
    <div class="flex w-full">
        <button class="btn btn-primary mx-auto btn-wide btn-lg" on:click={startOver}>Start over</button>
    </div>
    <div class="bg-base-300 flex w-full round h-20 rounded-2xl items-center justify-center">
        <SocialButtons />
    </div>
</footer>

