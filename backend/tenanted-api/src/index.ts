import { loadEnv } from './infra/loadEnv.ts'
import { expressApp } from './expressApp.ts'

loadEnv()

const app = expressApp()

app.listen(3000, () => {
  console.log('Listening on port 3000')
})
