<script lang="ts">
    export let saveHandler: (template: string) => Promise<void>
    export let template = ""
    let error = ""
    let info = ""
    let saving = false


    async function save() {
        if (template.length > 0) {
            try {
                saving = true
                error = ""
                info = ""
                await saveHandler(template)
                info = "Saved"
            } catch (e:any) {
                error = e.message
            } finally {
                saving = false
            }
        } else {
            error = "Please enter a template"
        }
    }

    function keyup() {
        error = ""
        info = ""
    }
</script>

<textarea class="textarea w-full input-bordered" rows="5" cols="80"
          placeholder="HTML template for how this model looks in a summary card" bind:value={template}
          on:keyup={keyup}></textarea>
{#if error}
    <div class="text-error mt-2">{error}</div>
{/if}
{#if info}
    <div class="text mt-2">{info}</div>
{/if}
<button class="btn" on:click={save}>Save</button>