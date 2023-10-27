<script lang="ts">
    import {onMount} from "svelte";
    import {mandatory, uuids} from "@cozemble/lang-util";
    import type {ImageWithQrCode} from "./types";
    import QrScanList from "./QrScanList.svelte";

    let video: HTMLVideoElement;
    let canvasElement: HTMLCanvasElement;
    let canvas: CanvasRenderingContext2D;
    let loadingMessage: HTMLElement;
    let beepSound: HTMLAudioElement;
    let status = "No QR code detected.";
    let foundCodes = new Set<string>(); // to store unique QR codes
    let foundImages: ImageWithQrCode[] = []; // to store QR code with its image
    let deviceType = "Temp Sensor";

    async function init() {
        try {
            video.srcObject = await navigator.mediaDevices.getUserMedia({video: {facingMode: "environment"}});
            video.setAttribute("playsinline", "true");
            video.play();
            requestAnimationFrame(tick);
        } catch (e) {
            console.error(e);
        }
    }

    function drawLine(begin: { x: number, y: number }, end: { x: number, y: number }, color: string) {
        canvas.beginPath();
        canvas.moveTo(begin.x, begin.y);
        canvas.lineTo(end.x, end.y);
        canvas.lineWidth = 4;
        canvas.strokeStyle = color;
        canvas.stroke();
    }

    function isMacAddress(text: string): boolean {
        return text.replace(/:/g, "").length === 12
    }

    function tick() {
        loadingMessage.innerText = "⌛ Loading video...";
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            loadingMessage.hidden = true;
            canvasElement.hidden = false;

            canvasElement.height = video.videoHeight;
            canvasElement.width = video.videoWidth;
            canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
            const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
            const code = (window as any).jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (code && isMacAddress(code.data) && !foundCodes.has(code.data) && code.data.trim().length > 0) {
                foundCodes = foundCodes.add(code.data);
                foundImages = [{id: uuids.v4(), code: code.data, image: canvasElement.toDataURL()}, ...foundImages]
                beepSound.play()

                drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
                drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
                drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
                drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
                status = `Found MAC Address: ${code.data}`;
            } else {
                status = "Scanning....";
            }
        }
        requestAnimationFrame(tick);
    }

    onMount(() => {
        canvas = mandatory(canvasElement.getContext("2d"), "2d");
        init();
    });
</script>

<svelte:head>
    <meta charset="utf-8">
    <title>QR Checkout</title>
    <script src="https://unpkg.com/jsqr/dist/jsQR.js"></script>
    <link href="https://fonts.googleapis.com/css?family=Ropa+Sans" rel="stylesheet">
</svelte:head>

<main>
    <div class="mb-4">
        <label class="label">Device type</label>
        <select class="input input-bordered" bind:value={deviceType}>
            <option>Temp Sensor</option>
            <option>Window Sensor</option>
            <option>Gateway</option>
        </select>
    </div>
    <video bind:this={video} id="video" width="600" height="600" muted hidden/>
    <div bind:this={loadingMessage} id="loadingMessage">🎥 Unable to access video stream (please make sure you have a
        webcam enabled)
    </div>
    <canvas bind:this={canvasElement} id="canvas" hidden/>
    <audio bind:this={beepSound} src="/beep.mp3" preload="auto"></audio>
    <div class="flex flex-wrap mx-2 mt-2">
        <QrScanList {foundImages} {deviceType}/>
    </div>
</main>

<style>
    canvas {
        width: 600px;
        height: 600px;
    }
</style>
