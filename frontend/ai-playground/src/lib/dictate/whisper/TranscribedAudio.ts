export type TranscriptionSource = TranscribedAudio | TranscribedImage | TranscribedWebsite

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

export interface TranscribedWebsite {
  _type: 'transcribed.website'
  url: string
  image: Blob | null
  transcription: string | null
}
