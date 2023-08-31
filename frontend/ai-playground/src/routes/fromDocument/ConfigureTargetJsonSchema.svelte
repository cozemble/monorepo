<script lang="ts">
    import type {Page} from "@cozemble/backend-aws-ocr-types";
    import type {Action} from "../ocr-as-html/ocrCorrectiveActions";
    import {applyCorrections} from "../ocr-as-html/applyCorrections";
    import {jsonToHtml} from "./jsonToHtml";
    import type {JsonSchema} from "@cozemble/model-core";
    import {onMount} from "svelte";
    import {convertSchemaToModels, reconfigureApp} from "../../lib/generative/components/helpers";
    import {newGenerationSessionId} from "../../lib/generative/stores";
    import {goto} from "$app/navigation";
    import {registerEverything} from "@cozemble/model-assembled";

    export let pages: Page[]
    export let actions: Action[]
    const mutatedPages = applyCorrections(actions, [], pages)
    const html = jsonToHtml(mutatedPages)
    let jsonSchema: JsonSchema | null = null

    onMount(() => {
        registerEverything()

        fetch("/fromDocument", {method: "POST", body: JSON.stringify({html})})
            .then(response => response.json())
            .then(response => onSchemaText(response.result))
    })

    function onSchemaText(schemaText: string) {
        const schema = JSON.parse(schemaText)
        const converted = convertSchemaToModels(schema)
        reconfigureApp(converted)
        newGenerationSessionId()
        goto("/fromDocument/data")
    }

</script>

jsonSchema = {jsonSchema}

