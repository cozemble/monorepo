<script lang="ts">
    import type {BoundingBox} from "./scratch/sectionFinder";
    import type {Writable} from "svelte/store";
    import {interactive} from "./interactiveBoundingBoxes";

    export let boundingBox: BoundingBox;
    export let index: number;
    export let htmlContainer: HTMLDivElement;
    export let boundingBoxes: Writable<BoundingBox[]>;
    export let selectedBoundingBox: Writable<BoundingBox|null>;

    function onBoundingBoxClick(event: MouseEvent) {
        event.stopPropagation();
        selectedBoundingBox.set(boundingBox);
        console.log({index, boundingBox, htmlContainer, boundingBoxes});
    }
</script>

<div use:interactive={{ index, htmlContainer, boundingBoxes }} class="bounding-box rounded"
     on:click={onBoundingBoxClick}
     style="position:absolute;
                top: {boundingBox.top}%;
                left: {boundingBox.left}%;
                width: calc({boundingBox.right}% - {boundingBox.left}%);
                height: calc({boundingBox.bottom}% - {boundingBox.top}%);">
</div>


<style>
    .bounding-box {
        position: absolute;
        border: 1px solid red;
    }
</style>
