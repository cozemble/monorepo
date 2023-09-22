<script lang="ts">
    import {onMount} from "svelte";
    import {mandatory, uuids} from "@cozemble/lang-util";
    import type {ImageWithQrCode} from "./types";

    let video: HTMLVideoElement;
    let canvasElement: HTMLCanvasElement;
    let canvas: CanvasRenderingContext2D;
    let loadingMessage: HTMLElement;
    let beepSound: HTMLAudioElement;
    let status = "No QR code detected.";
    let foundCodes = new Set<string>(); // to store unique QR codes
    let foundImages: ImageWithQrCode[] = []; // to store QR code with its image
    let gatewayId = 600

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

    async function handleOcr(image: ImageWithQrCode) {
        try {
            const response = await fetch('/ocr', {
                method: 'POST',
                body: createFormData(image.image),
            });

            const result = await response.json()
            if (isEnglishText(result.text) && result.text.length > 20) {
                foundImages = foundImages.map((i) => {
                    if (i.id === image.id) {
                        return {...i, ocrText: result.text, gatewayId: gatewayId++}
                    }
                    return i
                })
            }
        } catch (error) {
            console.error('Failed to ocr the image:', error);
        }
    }

    function isEnglishText(text: string): boolean {
        const totalCharacters = text.length;

        // Remove non-English characters and count the remaining characters
        const englishCharactersCount = text.replace(/[^a-zA-Z0-9\s.,!?'"()\-;]/g, '').length;

        // Calculate the percentage of English characters
        const englishCharacterPercentage = (englishCharactersCount / totalCharacters) * 100;

        return englishCharacterPercentage > 70; // Adjust threshold as necessary
    }

    function createFormData(dataUrl: string): FormData {
        const formData = new FormData();
        const dataUrlParts = dataUrl.split(',');

        if (dataUrlParts.length !== 2) {
            throw new Error('Invalid data URL format');
        }

        const byteString = atob(dataUrlParts[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], {type: 'image/png'});
        formData.append('image', blob);

        return formData;
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
                handleOcr(foundImages[foundImages.length - 1])

                drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
                drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
                drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
                drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
                status = `Found MAC Address: ${code.data}`;
            } else {
                status = "No MAC address QR code detected.";
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
    <video bind:this={video} id="video" width="600" height="600" muted hidden/>
    <div bind:this={loadingMessage} id="loadingMessage">🎥 Unable to access video stream (please make sure you have a
        webcam enabled)
    </div>
    <canvas bind:this={canvasElement} id="canvas" hidden/>
    <audio bind:this={beepSound} src="/beep.mp3" preload="auto"></audio>
    <div>{status}</div>
    <!-- Adding a section to display found QR codes and their images -->
    {#each foundImages as {code, image, ocrText, gatewayId}, index}
        <div>
            <h3>MAC Address: {code}</h3>
            <div class="flex border p-4">
                <img src={image} alt="QR code image" width="100" height="100"/>
                {#if ocrText}
                    <div>
                        <p class="ml-4">{ocrText}</p><br/>
                        {#if gatewayId}
                            <p class="ml-4"><strong>Gateway ID</strong>: {gatewayId}</p>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>
    {/each}
</main>

<style>
    canvas {
        width: 600px;
        height: 600px;
    }
</style>
