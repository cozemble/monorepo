<script>
  import ManageModels from "$lib/generative/components/ManageModels.svelte";
  import {goto} from "$app/navigation";
  import {onMount, tick} from "svelte";
  import {expandRecordAdditionRow} from "$lib/generative/autoExpander";
  import SocialButtons from "$lib/social/SocialButtons.svelte";
  import {editorExtensions} from "@cozemble/frontend-datatable";
  import ExtraRecordButtons from "$lib/dictate/ExtraRecordButtons.svelte";

  function startOver() {
    goto("/?startOver=true")
  }

  onMount(async () => {
    await tick()
    setTimeout(expandRecordAdditionRow, 5)
  })

  editorExtensions.registerRecordButtonExtensions(ExtraRecordButtons)
</script>

<div class="content w-100">
    <ManageModels/>
</div>

<footer class="footer p-10 bg-primary-content flex-col flex">
    <div class="flex w-full round h-12 rounded-2xl items-center justify-center">
        <SocialButtons />
    </div>
</footer>

