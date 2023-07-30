import express from 'express'
import multer from 'multer'
import { ImageAnnotatorClient } from '@google-cloud/vision'
import cors from 'cors'
import { loadEnv } from './loadEnv.js'

loadEnv()

const app = express()
app.use(cors())
const upload = multer()

// Initialize Google Vision client
const visionClient = new ImageAnnotatorClient()

// Route to handle file upload
app.post('/ocr', upload.single('image'), async (req, res) => {
  const apiKey = req.headers.authorization
  const imageFile = req.file

  // No API key provided
  if (!apiKey) {
    console.log('No API key provided')
    return res.status(401).json({ message: 'No API key provided' })
  }

  // No image provided
  if (!imageFile) {
    console.log('No image file provided')
    return res.status(400).json({ message: 'No image file provided' })
  }

  // Validate API key
  const secretKey = process.env.API_KEY

  if (apiKey !== secretKey) {
    console.log('Invalid API key', { apiKey, secretKey })
    return res.status(401).json({ message: 'Invalid API key' })
  }

  // Perform OCR using Google Vision API
  try {
    const [result] = await visionClient.textDetection(imageFile.buffer)
    const detections = result.textAnnotations
    const text = detections?.length ? detections[0].description : ''

    return res.json({ text })
  } catch (error: any) {
    console.error('Error', error)
    return res.status(500).json({ message: `Error: ${error.message}` })
  }
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
