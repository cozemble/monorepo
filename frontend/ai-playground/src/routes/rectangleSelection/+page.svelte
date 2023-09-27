<script>
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;
    let startX = 0;
    let startY = 0;
    let drawing = false;
    let imgWidth = 0;
    let imgHeight = 0;

    function onImageLoad() {
        const imgElement = document.getElementById("imageWrapper");
        if (imgElement) {
            imgWidth = imgElement.clientWidth;
            imgHeight = imgElement.clientHeight;
        }
    }

    function startDrawing(e) {
        const rect = e.target.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        drawing = true;
    }

    function draw(e) {
        if (!drawing) return;
        const rect = e.target.getBoundingClientRect();
        x = Math.min(e.clientX - rect.left, startX);
        y = Math.min(e.clientY - rect.top, startY);
        width = Math.abs(e.clientX - rect.left - startX);
        height = Math.abs(e.clientY - rect.top - startY);
    }

    function endDrawing() {
        if (!drawing) return;
        drawing = false;
        const leftPercent = (x / imgWidth) * 100;
        const topPercent = (y / imgHeight) * 100;
        const widthPercent = (width / imgWidth) * 100;
        const heightPercent = (height / imgHeight) * 100;
        console.log(`Left: ${leftPercent}%, Top: ${topPercent}%, Width: ${widthPercent}%, Height: ${heightPercent}%`);
    }
</script>

<style>
    .container {
        position: relative;
        display: inline-block;
    }
    .image-wrapper {
        display: inline-block;
    }
    img {
        display: block;
        max-width: 100%;
    }
    .selection {
        position: absolute;
        border: 2px dashed red;
        background-color: rgba(255, 0, 0, 0.3);
    }
</style>

<div class="container" on:mousedown={startDrawing} on:mousemove={draw} on:mouseup={endDrawing} on:mouseleave={endDrawing}>
    <div class="image-wrapper" id="imageWrapper">
        <img src="https://www.beginner-bookkeeping.com/images/Delivery_Docket_Template_Completed_Example.png" alt="Selectable" on:load={onImageLoad} />
    </div>
    {#if drawing}
        <div class="selection" style="left: {x}px; top: {y}px; width: {width}px; height: {height}px;"></div>
    {/if}
</div>
