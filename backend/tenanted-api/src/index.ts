import { loadEnv } from './infra/loadEnv.js'
import { expressApp } from './expressApp.js'

loadEnv()

const app = expressApp()

app.listen(3000, () => {
  console.log('Listening on port 3000')
})
