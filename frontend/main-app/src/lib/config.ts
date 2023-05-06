import { writable } from 'svelte/store'

let environmentValue = 'prod'
export const config = {
  backendUrl: () => {
    const endpointType = localStorage.getItem('cozemble.config.endpoint') || 'prod'
    if (endpointType === 'local') {
      return `http://localhost:3000/${environmentValue}`
    }
    return `https://backend-tenanted-api-qwquwvrytq-nw.a.run.app/${environmentValue}`
  },
}

export const environment = writable(environmentValue)
environment.subscribe((value) => {
  environmentValue = value
})

export const showDevConsole = writable(false)
