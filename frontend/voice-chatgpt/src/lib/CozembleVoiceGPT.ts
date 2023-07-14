import { voiceStore } from '$lib/store/store'

export class CozembleVoiceGPT {
  private mediaRecorder: MediaRecorder
  private mediaChunks: BlobPart[] = []
  private options: { type: 'audio/webm;codecs=opus' }

  constructor(private stream: MediaStream) { }

  async init() {
    this.mediaRecorder = new MediaRecorder(this.stream)

    this.mediaRecorder.onstop = async () => {
      // supported type mp3, mp4, mpeg, mpga, m4a, wav, and webm
      const audioBlob = new Blob(this.mediaChunks, this.options)

      this.mediaChunks = []

      voiceStore.set(audioBlob) // <- send to store
      await this.transcribe(audioBlob)
    }

    this.mediaRecorder.ondataavailable = (e) => {
      this.mediaChunks.push(e.data)
    }
  }

  blobToBase64(blob) {
    const reader = new FileReader()
    reader.readAsDataURL(blob)

    return new Promise((resolve) => {
      reader.onloadend = () => {
        resolve(reader.result)
      }
    })
  }

  async transcribe(audioBlob): Promise<string> {
    const ll = await this.blobToBase64(audioBlob)
    const audioData = ll.split(',')

    return new Promise((resolve, reject) => {
      fetch('/', {
        method: 'POST',
        body: JSON.stringify(audioData[1]),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
        .then((response) => response.json())
        .then((res) => resolve(res))
        .catch((e) => reject(e.message))
    })
  }

  start() {
    this.mediaRecorder.start()
  }

  stop() {
    this.stream.getAudioTracks().forEach((audio) => audio.stop())
    if (this.mediaRecorder) this.mediaRecorder.stop()
  }
}
