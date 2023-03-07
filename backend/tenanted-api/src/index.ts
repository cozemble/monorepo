import { loadEnv } from './infra/loadEnv'
import { expressApp } from './expressApp'

loadEnv()

const app = expressApp()

app.listen(3000, () => {
  console.log('Listening on port 3000')
})
