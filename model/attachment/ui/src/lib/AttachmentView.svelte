<script lang="ts">
    import type {AttachmentReference} from "@cozemble/model-attachment-core";

    export let attachment: AttachmentReference
</script>

<div class="">
    <img class=" w-12 h-12" src={attachment.thumbnailUrl}/>
</div>
