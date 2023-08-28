<script lang="ts">
    import {strings} from "@cozemble/lang-util";

    export let key: string;
</script>
<label class="label">{strings.camelcaseToSentenceCase(key)}</label>
