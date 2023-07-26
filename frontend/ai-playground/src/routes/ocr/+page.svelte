<script lang="ts">
    let file: File | null = null;
    let text = '';

    const uploadFile = async () => {
        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('image', file[0]);

        const response = await fetch('/ocr', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            text = result.text;
        } else {
            text = 'Error occurred during OCR processing.';
        }
    };
</script>

<input type="file" bind:files={file} />
<button on:click={uploadFile}>Upload</button>

<p>{text}</p>
