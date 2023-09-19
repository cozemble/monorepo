import Jimp from 'jimp'
import {
  BarcodeFormat,
  BinaryBitmap,
  DecodeHintType,
  HybridBinarizer,
  MultiFormatReader,
  RGBLuminanceSource,
} from '@zxing/library'
import { test } from 'vitest'

async function scanQR(image: string): Promise<any> {
  const jimp = await Jimp.read(image)
  const { data: rawImageData, width, height } = jimp.bitmap

  const hints = new Map()
  const formats = [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX]

  hints.set(DecodeHintType.POSSIBLE_FORMATS, formats)
  hints.set(DecodeHintType.TRY_HARDER, true)

  const reader = new MultiFormatReader()

  reader.setHints(hints)

  const len = rawImageData.width * rawImageData.height

  const luminancesUint8Array = new Uint8ClampedArray(len)

  for (let i = 0; i < len; i++) {
    luminancesUint8Array[i] =
      ((rawImageData.data[i * 4] +
        rawImageData.data[i * 4 + 1] * 2 +
        rawImageData.data[i * 4 + 2]) /
        4) &
      0xff
  }

  const luminanceSource = new RGBLuminanceSource(
    luminancesUint8Array,
    rawImageData.width,
    rawImageData.height,
  )

  console.log(luminanceSource)

  const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource))

  const qrCode = reader.decode(binaryBitmap)

  console.log(qrCode)

  if (qrCode) {
    return JSON.parse(qrCode.getText())
  } else {
    console.error('failed to decode qr code.')
  }
}

async function decodeQrCode(image) {
  const jimp = await Jimp.read(image)
  const { data: imageData, width, height } = jimp.bitmap

  // convert to luminance
  const luminance = new Uint8ClampedArray(width * height)
  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i]
    const g = imageData[i + 1]
    const b = imageData[i + 2]
    const avg = (r + g + b) / 3
    luminance[i / 4] = avg
  }

  const luminanceSource = new RGBLuminanceSource(luminance, width, height)
  const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource))

  const hints = new Map()
  const formats = [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX]

  hints.set(DecodeHintType.POSSIBLE_FORMATS, formats)
  hints.set(DecodeHintType.TRY_HARDER, true)

  const reader = new MultiFormatReader()
  return reader.decode(binaryBitmap, hints)
}

test('learning', async () => {
  console.log(await decodeQrCode('/Users/mikehogan/Downloads/success-qr.png'))
})
