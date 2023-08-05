import express from 'express'
import multer from 'multer'
import { ImageAnnotatorClient } from '@google-cloud/vision'
import cors from 'cors'
import { loadEnv } from './loadEnv.js'
import puppeteer from 'puppeteer'
import { DocumentProcessorServiceClient } from '@google-cloud/documentai'
import fs from 'fs'
import { PDFDocument, rgb as rgbFn } from 'pdf-lib'

loadEnv()

const app = express()
app.use(cors())
app.use(express.json()) // To parse JSON request bodies
const upload = multer()

const visionClient = new ImageAnnotatorClient()
const docAiClient = new DocumentProcessorServiceClient()

function getTableCellText(cell: any, document: any) {
  let text = ''
  const segments = cell.layout.textAnchor.textSegments ?? []
  segments.forEach((segment: any) => {
    const startIndex = parseInt(segment.startIndex, 10)
    const endIndex = parseInt(segment.endIndex, 10)
    text += (document.text ?? '').slice(startIndex, endIndex)
  })
  return text
}

app.post('/processPDF', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded')
  }
  try {
    const rectangles = JSON.parse(req.body.rectangles)
    console.log({ rectangles })
    const uploadedFile = req.file.buffer

    const modifiedPDFBytes = await applyPdfMasking(uploadedFile, rectangles)

    res.setHeader('Content-Disposition', 'attachment; filename=processed.pdf')
    res.setHeader('Content-Type', 'application/pdf')
    res.end(modifiedPDFBytes)
  } catch (error: any) {
    res.status(500).send('Error processing the PDF: ' + error.message)
  }
})

async function applyPdfMasking(pdfFile: any, rectangles: any): Promise<any> {
  const pdfDoc = await PDFDocument.load(pdfFile)
  const pages = pdfDoc.getPages()

  for (const rect of rectangles) {
    const { x, y, width, height, startPage, endPage, rgb } = rect

    for (let i = startPage - 1; i < endPage; i++) {
      if (i < pages.length) {
        pages[i].drawRectangle({
          x: x,
          y: y,
          width: width,
          height: height,
          color: rgb ? rgbFn(rgb[0], rgb[1], rgb[2]) : rgbFn(1, 1, 1), // Default to white if no rgb provided
        })
      }
    }
  }
  return await pdfDoc.save()
}

app.post('/form-processor', upload.single('image'), async (req, res) => {
  const imageFile = req.file
  if (!imageFile) {
    return res.status(400).send('No image file provided')
  }
  const mimeType = imageFile.mimetype
  if (!mimeType) {
    return res.status(400).send('No mimeType inferred')
  }
  const rectangles = JSON.parse(req.body.rectangles ?? '[]')
  console.log({ rectangles })

  const docAiProcessorName = process.env.GCP_DOCAI_FORM_PROCESSOR_NAME
  if (!docAiProcessorName) {
    console.log('No docAiProcessorName provided')
    return res.status(500).json({ message: 'No docAiProcessorName provided' })
  }
  let buffer = imageFile.buffer
  if (mimeType === 'application/pdf' && rectangles.length > 0) {
    console.log({ mimeType, rectangles, imageFile })
    buffer = await applyPdfMasking(buffer, rectangles)
    if (!buffer) {
      return res.status(500).json({ message: 'Error applying PDF masking' })
    }
    fs.writeFileSync('masked.pdf', buffer)
  }

  try {
    const request = {
      name: docAiProcessorName,
      rawDocument: {
        mimeType,
        content: buffer,
      },
    }

    const [result] = await docAiClient.processDocument(request)
    const { document } = result
    if (!document) {
      console.log('No document returned')
      return res.status(500).json({ message: 'No document returned' })
    }
    if (!document.pages) {
      console.log('No pages returned')
      return res.status(500).json({ message: 'No pages returned' })
    }

    let htmlContent = '<div>'

    const allElements: any[] = []
    document.pages.forEach((page) => {
      allElements.push(...(page.tables || []), ...(page.paragraphs || []))
    })
    fs.writeFileSync('allElements.json', JSON.stringify(allElements, null, 2))
    fs.writeFileSync('result.json', JSON.stringify(result, null, 2))

    const allTables: string[] = []

    allElements.forEach((element) => {
      try {
        if (element.headerRows || element.bodyRows) {
          // This will identify the element as a table
          let tableHtml = '<table border="1">'

          if (element.headerRows) {
            element.headerRows.forEach((row: any) => {
              tableHtml += '<thead><tr>'
              row.cells.forEach((cell: any) => {
                const cellText = getTableCellText(cell, document)

                tableHtml += `<th>${cellText}</th>`
              })
              tableHtml += '</tr></thead>'
            })
          }

          if (element.bodyRows) {
            tableHtml += '<tbody>'
            element.bodyRows.forEach((row: any) => {
              tableHtml += '<tr>'
              row.cells.forEach((cell: any) => {
                const cellText = getTableCellText(cell, document)

                tableHtml += `<td>${cellText}</td>`
              })
              tableHtml += '</tr>'
            })
            tableHtml += '</tbody>'
          }

          tableHtml += '</table>'
          if (!allTables.includes(tableHtml)) {
            allTables.push(tableHtml)
            htmlContent += tableHtml
          }
        } else if (element.type === 'paragraph') {
          const startIndex = parseInt(element.layout.textAnchor.textSegments[0].startIndex, 10)
          const endIndex = parseInt(element.layout.textAnchor.textSegments[0].endIndex, 10)
          const paragraphText = (document.text ?? '').slice(startIndex, endIndex).replace(/\n/g, '')

          if (paragraphText.trim()) {
            htmlContent += `<p>${paragraphText}</p>`
          }
        }
      } catch (e: any) {
        e.message = `Error processing element: ${JSON.stringify(element)}\n${e.message}`
        throw e
      }
    })

    htmlContent += '</div>'
    return res.header('Content-Type', 'text/html').send(htmlContent)
  } catch (error: any) {
    console.error('Error', error)
    return res.status(500).json({ message: `Error: ${error.message}` })
  }
})

app.post('/doc-to-html', upload.single('image'), async (req, res) => {
  const imageFile = req.file

  if (!imageFile) {
    return res.status(400).send('No image file provided')
  }

  const docAiProcessorName = process.env.GCP_DOCAI_PROCESSOR_NAME

  try {
    const request = {
      name: docAiProcessorName,
      rawDocument: {
        mimeType: 'image/png',
        content: imageFile.buffer.toString('base64'),
      },
    }

    const [result] = await docAiClient.processDocument(request)
    const { document } = result

    if (!document) {
      console.log('No document returned')
      return res.status(500).json({ message: 'No document returned' })
    }
    if (!document.pages) {
      console.log('No pages returned')
      return res.status(500).json({ message: 'No pages returned' })
    }

    // Merge blocks, tables, and paragraphs
    const allElements: any[] = []
    document.pages.forEach((page: any) => {
      allElements.push(...page.blocks.map((block: any) => ({ type: 'block', data: block })))
      allElements.push(...page.tables.map((table: any) => ({ type: 'table', data: table })))
      allElements.push(
        ...(page.paragraphs?.map((paragraph: any) => ({ type: 'paragraph', data: paragraph })) ||
          []),
      )
    })

    // Sort by y, then x coordinates
    allElements.sort((a, b) => {
      const aVertices = a.data.layout?.boundingBox?.normalizedVertices
      const bVertices = b.data.layout?.boundingBox?.normalizedVertices

      const ay = aVertices ? aVertices[0].y : 0
      const by = bVertices ? bVertices[0].y : 0
      const ax = aVertices ? aVertices[0].x : 0
      const bx = bVertices ? bVertices[0].x : 0

      return ay !== by ? ay - by : ax - bx
    })
    fs.writeFileSync('all-elements.json', JSON.stringify(allElements, null, 2))
    // Convert to HTML
    let htmlContent = '<div>'
    let combinedText = ''
    let previousY = -1

    allElements.forEach((element) => {
      if (element.type === 'paragraph') {
        const startIndex = parseInt(element.data.layout.textAnchor.textSegments[0].startIndex, 10)
        const endIndex = parseInt(element.data.layout.textAnchor.textSegments[0].endIndex, 10)
        const textContent = (document.text ?? '').slice(startIndex, endIndex)

        const currentY = element.data.layout.boundingPoly.normalizedVertices[0].y

        // Check if this line is close enough to the previous line
        if (previousY >= 0 && Math.abs(currentY - previousY) < 0.02) {
          // Combine with the previous line
          combinedText += ` ${textContent}`
        } else {
          // Start a new paragraph
          if (combinedText) {
            htmlContent += `<p>${combinedText}</p>`
          }
          combinedText = textContent
        }

        previousY = currentY
      }
    })

    // Add any remaining combined text
    if (combinedText) {
      htmlContent += `<p>${combinedText}</p>`
    }
    htmlContent += '</div>'

    return res.header('Content-type', 'text/html').send(htmlContent)
  } catch (error: any) {
    console.error('Error', error)
    return res.status(500).send(`Error: ${error.message}`)
  }
})

app.post('/doc-ocr', upload.single('image'), async (req, res) => {
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

  const docAiProcessorName = process.env.GCP_DOCAI_PROCESSOR_NAME
  if (!docAiProcessorName) {
    console.log('No docAiProcessorName provided')
    return res.status(500).json({ message: 'No docAiProcessorName provided' })
  }

  // Perform OCR using Google Document AI
  try {
    const request = {
      name: docAiProcessorName,
      rawDocument: {
        mimeType: 'image/png', // set the MIME type to image/png
        content: imageFile.buffer.toString('base64'),
      },
    }

    const [result] = await docAiClient.processDocument(request)
    const { document } = result
    if (!document) {
      console.log('No document returned')
      return res.status(500).json({ message: 'No document returned' })
    }

    const text = document.text
    if (!document.pages) {
      console.log('No pages returned')
      return res.status(500).json({ message: 'No pages returned' })
    }

    const blocks = document.pages.flatMap((page: any) =>
      page.blocks.map((block: any) => ({
        blockType: block.blockType,
        layout: block.layout,
        text: block.layout.textAnchor.textSegments.map((segment: any) => segment.text).join(''),
      })),
    )

    let htmlContent = '<div>'

    // Extract blocks and convert to HTML divs
    document.pages.forEach((page: any) => {
      page.blocks.forEach((block: any) => {
        const blockText = block.layout.textAnchor.textSegments
          .map((segment: any) => segment.text)
          .join('')
        htmlContent += `<div>${blockText}</div>`
      })

      // Extract tables and convert to HTML tables
      if (page.tables) {
        page.tables.forEach((table: any) => {
          htmlContent += '<table>'
          table.rows.forEach((row: any) => {
            htmlContent += '<tr>'
            row.cells.forEach((cell: any) => {
              const cellText = cell.layout.textAnchor.textSegments
                .map((segment: any) => segment.text)
                .join('')
              htmlContent += `<td>${cellText}</td>`
            })
            htmlContent += '</tr>'
          })
          htmlContent += '</table>'
        })
      }

      // Extract paragraphs and convert to HTML paragraphs (optional if you're already extracting blocks)
      page.paragraphs?.forEach((paragraph: any) => {
        const paragraphText = paragraph.layout.textAnchor.textSegments
          .map((segment: any) => segment.text)
          .join('')
        htmlContent += `<p>${paragraphText}</p>`
      })
    })

    htmlContent += '</div>'

    return res.json({ text, blocks, htmlContent })

    return res.json({ text, blocks })
  } catch (error: any) {
    console.error('Error', error)
    return res.status(500).json({ message: `Error: ${error.message}` })
  }
})

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
    const blocks = detections?.slice(1).map((detection) => detection.description)

    return res.json({ text, blocks })
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
