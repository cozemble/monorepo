<script lang="ts">
    import {afterUpdate} from "svelte";
    import {toastNoticeStore} from "./toastNoticeStore";

    afterUpdate(() => console.log("afterUpdate", $toastNoticeStore));
</script>

{#each $toastNoticeStore as toast}
    <div class="toast toast-top toast-end">
        <div class="alert alert-{toast.level}">
            <div>
                <span>{toast.message}</span>
            </div>
        </div>
    </div>
{/each}