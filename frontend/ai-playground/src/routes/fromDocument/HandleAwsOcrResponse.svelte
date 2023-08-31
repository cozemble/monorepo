<script lang="ts">
    import type {AwsOcrResponse} from "../aws-ocr/awsOcrTypes";
    import OcrJsonCorrection from "../ocr-as-html/OcrJsonCorrection.svelte";
    import {writable} from "svelte/store";

    export let awsOcrResponse:AwsOcrResponse
</script>
<OcrJsonCorrection pages={writable(awsOcrResponse.json.pages)}/>
