export default {
  addRecord: async (model: Record<string, any>, record: Record<string, any>) => {
    console.log('addRecord')

    // delay to simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // throw error randomly
    if (Math.random() > 0.5) {
      throw createMockError(record)
    }

    return record
  },

  updateRecord: async (
    model: Record<string, any>,
    changes: { from: Record<string, any>; to: Record<string, any> },
  ) => {
    console.log('updateRecord', changes)

    // delay to simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 3000))

    return changes.to
  },
}

const createMockError = (record: Record<string, any>) => {
  // add error to random field
  const fields = Object.keys(record)
  const randomField = fields[Math.floor(Math.random() * fields.length)]

  return {
    [randomField]: 'Not unique',
  }
}
