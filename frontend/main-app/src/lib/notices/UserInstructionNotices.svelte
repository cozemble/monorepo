<script lang="ts">

    import {type IssuedUserInstruction, userInstructionStore, userInstructionStoreFns} from "./userInstructionStore";

    function dismiss(instruction: IssuedUserInstruction) {
        userInstructionStoreFns.dismiss(instruction)
    }
</script>
{#each $userInstructionStore as instruction}
    {#if !instruction.dismissed}
        {#if instruction.instruction.detail._type === "setup.summary.view.user.instruction"}
            <div class="toast toast-top toast-end">
                <div class="alert alert-info">
                    <div class="flex flex-col">
                        <h6>How to create a summary view for {instruction.instruction.detail.modelName.value}</h6>
                        <div class="flex flex-col">
                            <p>1. Click on <strong>Models</strong> in the side menu</p>
                            <p>2. Click <strong>Edit</strong> on the {instruction.instruction.detail.modelName.value} model row</p>
                            <p>3. Click <strong>Appearance</strong> on the<br/>top menu for the {instruction.instruction.detail.modelName.value} model</p>
                            <p>4. In the <strong>Summary card HTML</strong> box, enter a HTML<br/>
                                template expression to configure how a {instruction.instruction.detail.modelName.value}<br/>
                                record should look when it is summarised</p>
                        </div>
                        <button class="btn btn-sm" on:click={() => dismiss(instruction)}>Dismiss</button>
                    </div>
                </div>
            </div>
        {/if}
    {/if}
{/each}