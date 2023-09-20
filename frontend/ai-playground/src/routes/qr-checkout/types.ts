export interface ImageWithQrCode {
  id: string
  code: string
  image: string
  ocrText?: string
  gatewayId?: number
}
