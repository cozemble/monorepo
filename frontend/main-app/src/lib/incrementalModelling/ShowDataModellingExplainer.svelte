<script lang="ts">
    import {DataModellingExplainer} from "@cozemble/frontend-datatable";

    let explainerSeen = localStorage.getItem('com.cozemble.data.modelling.explainer.seen') === 'true'

    function onExplainerFinish() {
        explainerSeen = true
        localStorage.setItem('com.cozemble.data.modelling.explainer.seen', 'true')
    }
</script>
{#if explainerSeen}
    <slot></slot>
{:else}
    <div class="w-full flex items-center mt-8 flex-col">
        <div class="mb-4">
            <h2>Welcome to Cozemble</h2>
        </div>
        <div>
            <DataModellingExplainer on:finish={onExplainerFinish}/>
        </div>
    </div>
{/if}