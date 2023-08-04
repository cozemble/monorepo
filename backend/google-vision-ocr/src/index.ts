import express from 'express'
import multer from 'multer'
import { ImageAnnotatorClient } from '@google-cloud/vision'
import cors from 'cors'
import { loadEnv } from './loadEnv.js'
import puppeteer from 'puppeteer'

loadEnv()

const app = express()
app.use(cors())
app.use(express.json()) // To parse JSON request bodies
const upload = multer()

// Initialize Google Vision client
const visionClient = new ImageAnnotatorClient()

// Route to handle file upload
app.post('/ocr', upload.single('image'), async (req, res) => {
  const imageFile = req.file

  const apiKey = req.headers.authorization
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

const PUPPETEER_OPTIONS = {
  headless: true,
  args: [
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
    '--no-first-run',
    '--no-sandbox',
    '--no-zygote',
    '--single-process',
    "--proxy-server='direct://'",
    '--proxy-bypass-list=*',
    '--deterministic-fetch',
    '--disable-dbus',
    '--disable-software-rasterizer',
  ],
}

app.post('/screenshot', async (req, res) => {
  const data = req.body
  if (!data || !data.url) {
    return res.status(400).json({ message: 'No URL provided' })
  }
  const apiKey = req.headers.authorization
  if (!apiKey) {
    console.log('No API key provided')
    return res.status(401).json({ message: 'No API key provided' })
  }

  // Validate API key
  const secretKey = process.env.API_KEY

  if (apiKey !== secretKey) {
    console.log('Invalid API key', { apiKey, secretKey })
    return res.status(401).json({ message: 'Invalid API key' })
  }

  const selectors = (data.selectors || []).filter((s: string) => s.trim().length > 0)

  try {
    const browser = await puppeteer.launch(PUPPETEER_OPTIONS)
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 4000 })
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537',
    )

    await page.goto(data.url)

    // Remove elements from the DOM
    for (const selector of selectors) {
      await page.evaluate((sel) => {
        const elements = document.querySelectorAll(sel)
        for (const element of elements) {
          element.parentNode.removeChild(element)
        }
      }, selector)
    }

    const screenshot = await page.screenshot({ encoding: 'binary', fullPage: true })
    await browser.close()

    res.set('Content-Type', 'image/png').send(screenshot)
  } catch (error: any) {
    console.error(error)
    res.status(500).json({ message: error.message })
  }
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
