<script lang="ts">
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher()
    let file: File | null = null;

    const uploadFile = async () => {
        if (!file || !file[0]) {
            return;
        }
        dispatch('upload', file[0])
    };

    function cancel() {
        dispatch('cancel')
    }
</script>

<input type="file" class="input input-bordered pt-2" bind:files={file}/>
<button class="btn btn-primary ml-2" on:click={uploadFile}>Upload</button>
<button class="btn btn-secondary ml-2" on:click={cancel}>Cancel</button>

