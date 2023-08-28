<script lang="ts">
    import type {Page} from "@cozemble/backend-aws-ocr-types";
    import type {Writable} from "svelte/store";
    import type {Action} from "./ocrCorrectiveActions";

    export let pages: Writable<Page[]>
    export let actions: Writable<Action[]>
</script>