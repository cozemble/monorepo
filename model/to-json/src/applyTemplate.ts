export interface Data {
  [key: string]: any
}

export function applyTemplate(template: string, data: Data): string {
  return template.replace(/{{([^}]+)}}/g, (match: string, path: string) => {
    const keys = path.split('.')
    let value: any = data

    for (const key of keys) {
      const matches = key.match(/([^\[\]]+)|\[(\d+)]/g)
      if (!matches) {
        return ''
      }

      for (const part of matches) {
        const index = parseInt(part.replace(/^\[/, '').replace(/\]$/, ''), 10)
        value = value?.[isNaN(index) ? part : index]

        if (value === undefined) {
          break
        }
      }

      if (value === undefined) {
        break
      }
    }

    return value === undefined ? '' : value
  })
}
