<script lang="ts">
    import GenericStringEditor from "./GenericStringEditor.svelte";
    import type {StringPropertyConfiguration} from "@cozemble/model-properties-core";
    import type {ChangeHandler} from "$lib";

    export let configuration: StringPropertyConfiguration
    export let value: string | null
    export let changeHandler: ChangeHandler<string>
    export let closeHandler: () => void
</script>

<GenericStringEditor {value} multiline={configuration.multipleLines === true} {changeHandler} {closeHandler}/>
