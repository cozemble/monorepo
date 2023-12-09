import { type RequestEvent, type RequestHandler } from '@sveltejs/kit'
import axios from 'axios'

const fileTypes = ['application/pdf'];

const OPENAI_KEY = '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';
const AWS_OCR_KEY = '2b0a5cbe-783b-46b6-8787-24e7a390b191';

const AWS_OCR_URL = ' https://gkxoxjr0h8.execute-api.eu-west-2.amazonaws.com/prod/ocr';
const ChatGPTURL = 'https://api.openai.com/v1/engines/davinci-codex/completions';

export const POST: RequestHandler = async (event: RequestEvent) => {
  try {
    const formData = await event.request.formData()
    const file = formData.get('file')
  
    // validate file type
    if (!(file instanceof File) || !fileTypes.includes(file.type)) {
      return new Response('Error: Invalid file type', { status: 400 })
    }
  
    const ocrResponse = axios.post(AWS_OCR_URL, file, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `${AWS_OCR_KEY}`
      }
    })
  
    const extractedData = (await ocrResponse).data
  
    const openAiResponse = await axios.post(ChatGPTURL, {
        prompt: `
          Convert the following JSON to JSON Schema: 
          ${JSON.stringify(extractedData)}
        `,
        max_tokens: 150,
    }, {
        headers: {'Authorization': `Bearer ${OPENAI_KEY}`}
    });
  
    const jsonSchema = openAiResponse.data.choices[0].text;
    return new Response(JSON.stringify(jsonSchema), { status: 200 })   
  } catch (error) {
    console.error(error)

    let errorMessage = 'Internal server error';
    let statusCode = 500;

    if(axios.isAxiosError(error)){
      errorMessage = 'Error in external API call';
      statusCode = error.response?.status || 500;
    }else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new Response(`Error: ${errorMessage}`, { status: statusCode })
  }
}
