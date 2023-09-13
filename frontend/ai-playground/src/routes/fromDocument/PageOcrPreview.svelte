<script lang="ts">

    import type {Page} from "@cozemble/backend-aws-ocr-types";
    import RenderOcrJson from "../ocr-as-html/RenderOcrJson.svelte";
    export let ocredPage:Page
</script>
<RenderOcrJson pages={[ocredPage]}/>
