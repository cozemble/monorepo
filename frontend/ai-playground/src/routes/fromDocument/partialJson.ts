export interface Partial {
  _type: 'partial'
  json: string
}

export function partial(json: string): Partial {
  return {
    _type: 'partial',
    json,
  }
}

export interface Json {
  _type: 'json'
  json: string
}

export function json(json: string): Json {
  return {
    _type: 'json',
    json,
  }
}

export type PartialJson = Partial | Json

export function formatJson(partialJson: PartialJson): string {
  if (partialJson._type === 'partial') {
    return partialJson.json
  } else {
    return JSON.stringify(JSON.parse(partialJson.json), null, 2)
  }
}
