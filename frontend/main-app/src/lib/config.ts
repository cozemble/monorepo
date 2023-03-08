const production = {
  backendUrl: () => {
    return 'https://backend-tenanted-api-qwquwvrytq-nw.a.run.app'
  },
}

const local = {
  backendUrl: () => {
    return 'http://localhost:3000'
  },
}

export function useLocal() {
  config = local
}

export let config = production
