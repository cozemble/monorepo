import { describe, expect, it } from 'vitest'
import { extractJSON } from '../src/lib/generative/extractJson'

describe('extractJSON', () => {
  it('should extract JSON from text correctly', () => {
    const content = `
            Here is some preamble.
            {
                "key1": "value1",
                "key2": {
                    "nestedKey": "nestedValue"
                }
            }
            Here is some summary.
        `
    const json = extractJSON(content)
    expect(json).toEqual({
      key1: 'value1',
      key2: {
        nestedKey: 'nestedValue',
      },
    })
  })

  it('should return null when no JSON is present', () => {
    const content = 'Here is some preamble. Here is some summary.'
    const json = extractJSON(content)
    expect(json).toBeNull()
  })

  it('should return null when invalid JSON is present', () => {
    const content = 'Here is some preamble. { invalid json } Here is some summary.'
    const json = extractJSON(content)
    expect(json).toBeNull()
  })

  it('should extract JSON when no preamble is present', () => {
    const content = `
            {
                "key1": "value1",
                "key2": {
                    "nestedKey": "nestedValue"
                }
            }
            Here is some summary.
        `
    const json = extractJSON(content)
    expect(json).toEqual({
      key1: 'value1',
      key2: {
        nestedKey: 'nestedValue',
      },
    })
  })

  it('should extract JSON when no summary is present', () => {
    const content = `
            Here is some preamble.
            {
                "key1": "value1",
                "key2": {
                    "nestedKey": "nestedValue"
                }
            }
        `
    const json = extractJSON(content)
    expect(json).toEqual({
      key1: 'value1',
      key2: {
        nestedKey: 'nestedValue',
      },
    })
  })

  it('should extract JSON when no preamble and summary are present', () => {
    const content = `
            {
                "key1": "value1",
                "key2": {
                    "nestedKey": "nestedValue"
                }
            }
        `
    const json = extractJSON(content)
    expect(json).toEqual({
      key1: 'value1',
      key2: {
        nestedKey: 'nestedValue',
      },
    })
  })
})

describe('extractJSON', () => {
  it('should extract JSON array from text correctly', () => {
    const content = `
            Here is some preamble.
            [
                {
                    "key1": "value1",
                    "key2": {
                        "nestedKey": "nestedValue"
                    }
                },
                {
                    "key3": "value3",
                    "key4": {
                        "nestedKey": "nestedValue"
                    }
                }
            ]
            Here is some summary.
        `
    const json = extractJSON(content)
    expect(json).toEqual([
      {
        key1: 'value1',
        key2: {
          nestedKey: 'nestedValue',
        },
      },
      {
        key3: 'value3',
        key4: {
          nestedKey: 'nestedValue',
        },
      },
    ])
  })

  it('should return null when invalid JSON array is present', () => {
    const content = 'Here is some preamble. [ { invalid json } ] Here is some summary.'
    const json = extractJSON(content)
    expect(json).toBeNull()
  })

  it('should extract JSON array when no preamble is present', () => {
    const content = `
            [
                {
                    "key1": "value1",
                    "key2": {
                        "nestedKey": "nestedValue"
                    }
                }
            ]
            Here is some summary.
        `
    const json = extractJSON(content)
    expect(json).toEqual([
      {
        key1: 'value1',
        key2: {
          nestedKey: 'nestedValue',
        },
      },
    ])
  })

  it('should extract JSON array when no summary is present', () => {
    const content = `
            Here is some preamble.
            [
                {
                    "key1": "value1",
                    "key2": {
                        "nestedKey": "nestedValue"
                    }
                }
            ]
        `
    const json = extractJSON(content)
    expect(json).toEqual([
      {
        key1: 'value1',
        key2: {
          nestedKey: 'nestedValue',
        },
      },
    ])
  })

  it('should extract JSON array when no preamble and summary are present', () => {
    const content = `
            [
                {
                    "key1": "value1",
                    "key2": {
                        "nestedKey": "nestedValue"
                    }
                }
            ]
        `
    const json = extractJSON(content)
    expect(json).toEqual([
      {
        key1: 'value1',
        key2: {
          nestedKey: 'nestedValue',
        },
      },
    ])
  })
})
