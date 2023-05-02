import type { ModelPath, ModelPathElement } from '@cozemble/model-core'
import { modelPathFns } from '@cozemble/model-api'

export type HtmlMarkupValue = '<br/>' | ' '

export interface HtmlMarkup {
  _type: 'html.markup'
  markup: HtmlMarkupValue
}

export type Part = ModelPath<ModelPathElement> | HtmlMarkup

function asModelPath(
  paths: ModelPath<ModelPathElement>[],
  word: string,
): ModelPath<ModelPathElement> | null {
  return paths.find((p) => word === modelPathFns.toDottedNamePath(p).value) ?? null
}

export function htmlTemplateAsParts(
  template: string,
  modelElementPaths: ModelPath<ModelPathElement>[],
): Part[] {
  const parts: Part[] = []
  while (template.length > 0) {
    if (template.startsWith('<br/>')) {
      parts.push({ _type: 'html.markup', markup: '<br/>' })
      template = template.slice(5)
    } else if (template.startsWith(' ')) {
      parts.push({ _type: 'html.markup', markup: ' ' })
      template = template.slice(1)
    } else if (template.startsWith('{{')) {
      const end = template.indexOf('}}')
      const word = template.slice(2, end)
      const path = asModelPath(modelElementPaths, word)
      if (path) {
        parts.push(path)
      } else {
        throw new Error(`Unexpected template: ${template}, on finding word: ${word}`)
      }
      template = template.slice(end + 2)
    } else {
      throw new Error(`Unexpected template: ${template}`)
    }
  }
  return parts
}

export function toLines(parts: Part[]): Part[][] {
  const lines: Part[][] = []
  let currentLine: Part[] = []
  for (const part of parts) {
    if (part._type === 'html.markup' && part.markup === '<br/>') {
      currentLine.push(part)
      lines.push(currentLine)
      currentLine = []
    } else {
      currentLine.push(part)
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine)
  }
  return lines
}
