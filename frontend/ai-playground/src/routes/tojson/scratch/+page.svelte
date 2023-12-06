<script lang="ts">

    let file: File | null = null;
    let text = '';

    async function fileToBase64(file: File) {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }

    const uploadFile = async () => {
        if (!file) {
            console.log('No file selected')
            return;
        }
        // convert the file to base 64
        const fileBase64 = await fileToBase64(file[0]);
        const formData = new FormData();
        formData.append('image', fileBase64);
        const response = await fetch('/genai/stream/jsonFromVision', {
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

<div class="flex flex-col w-1/3">
<input type="file" bind:files={file}/>
<button class="btn btn-primary mt-4" on:click={uploadFile}>Upload</button>
</div>
<p>{text}</p>

