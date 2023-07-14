<script lang="ts">
  import { onMount } from 'svelte'
  import { voiceStore } from '$lib/store/store'
  import { CozembleVoiceGPT } from '$lib/CozembleVoiceGPT'

let cozembleGPT: CozembleVoiceGPT;

voiceStore.subscribe((value) => {
  // console.log(value) // <- subscribe to expected value
  // const audioInput = document.querySelector('audio');

  // if(audioInput){
  //     audioInput.src = URL.createObjectURL(value as Blob)
  // }
})

onMount(async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  
  cozembleGPT = new CozembleVoiceGPT(stream)
  await cozembleGPT.init()
});

const startRecording = () => cozembleGPT.start()
const stopRecording =() => cozembleGPT.stop()  
</script>

<section>
  <audio controls />
  <button on:click={startRecording}>Record</button>
  <button on:click={stopRecording}>Stop</button>  
</section>

