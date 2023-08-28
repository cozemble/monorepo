<script lang="ts">
    import type {Page} from "@cozemble/backend-aws-ocr-types";
    import type {Writable} from "svelte/store";
    import type {Action} from "./ocrCorrectiveActions";
    import {zodToFom} from "@cozemble/frontend-cozemble-forms";
    import {extendSchema} from "./fomFormExtender";
    import {actions as actionsType} from "./ocrCorrectiveActions";

    export let pages: Writable<Page[]>
    export let actions: Writable<Action[]>

    $: schema = extendSchema(zodToFom(actionsType),$actions)
</script>