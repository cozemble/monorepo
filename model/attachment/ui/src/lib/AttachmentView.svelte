<script lang="ts">
    import type {AttachmentReference} from "@cozemble/model-attachment-core";

    export let attachment: AttachmentReference
</script>

<div class="m-1 p-1">
    <img class="m-1 p-1 w-12 h-12" src={attachment.thumbnailUrl}/>
</div>
