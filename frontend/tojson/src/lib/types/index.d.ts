type Model = {
  name: string
  description: string
  schema: ModelSchema

  _id: string
  _createdAt: string
  _updatedAt: string
}

type ModelSchema = Record<string, any>

type DataRecord = {
  value: Record<string, any>
  modelId: string

  fromFile: boolean
  filename?: string
  ocrResult?: string
  validated: boolean
  /** when file is populated */
  file?: File

  _id: string
  _createdAt: string
  _updatedAt: string
}

interface HelperText {
  error: boolean
  text: string | null
}
