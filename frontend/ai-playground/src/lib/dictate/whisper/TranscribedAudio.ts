export type TranscriptionSource = TranscribedAudio | TranscribedImage

export interface TranscribedAudio {
  _type: 'transcribed.audio'
  audio: Blob
  transcription: string | null
}

export interface TranscribedImage {
  _type: 'transcribed.image'
  image: Blob
  transcription: string | null
}
